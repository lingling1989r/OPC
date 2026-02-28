/**
 * 评论管理模块
 * 监控、分类和回复各平台的评论
 */

import * as puppeteer from 'puppeteer';
import { getPlatformConfig } from './config';

export enum CommentType {
  INQUIRY = 'inquiry',      // 产品咨询
  SUPPORT = 'support',      // 技术支持
  BUSINESS = 'business',    // 商务合作
  NEGATIVE = 'negative',    // 负面反馈
  INTERACTION = 'interaction', // 一般互动
}

export interface Comment {
  id: string;
  platform: 'twitter' | 'facebook' | 'wechat';
  author: string;
  content: string;
  postId?: string;
  timestamp: Date;
  type?: CommentType;
  replied?: boolean;
}

export interface ReplyResult {
  success: boolean;
  replyId?: string;
  error?: string;
}

/**
 * 评论分类器
 */
export function classifyComment(content: string): CommentType {
  const lowerContent = content.toLowerCase();

  // 负面反馈关键词
  const negativeKeywords = ['bug', 'error', 'broken', 'not working', '失望', '垃圾', '太差', 'problem', 'issue'];
  if (negativeKeywords.some(k => lowerContent.includes(k))) {
    return CommentType.NEGATIVE;
  }

  // 商务合作关键词
  const businessKeywords = ['合作', 'partnership', 'collab', 'business', '企业', '团队', 'price', 'pricing'];
  if (businessKeywords.some(k => lowerContent.includes(k))) {
    return CommentType.BUSINESS;
  }

  // 技术支持关键词
  const supportKeywords = ['help', 'how to', '怎么', '如何', 'tutorial', 'guide', 'support', 'technical'];
  if (supportKeywords.some(k => lowerContent.includes(k))) {
    return CommentType.SUPPORT;
  }

  // 产品咨询关键词
  const inquiryKeywords = ['price', 'cost', '多少钱', 'pricing', 'feature', '功能', 'available', '有吗'];
  if (inquiryKeywords.some(k => lowerContent.includes(k))) {
    return CommentType.INQUIRY;
  }

  return CommentType.INTERACTION;
}

/**
 * 评论管理器
 */
export class CommentManager {
  private browser: puppeteer.Browser | null = null;
  private processedComments = new Set<string>();

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 获取 Twitter 评论
   */
  async fetchTwitterComments(postUrl?: string): Promise<Comment[]> {
    const config = getPlatformConfig('twitter');
    if (!config.enabled || !config.cookie) {
      return [];
    }

    try {
      if (!this.browser) await this.init();
      const page = await this.browser!.newPage();

      await page.setCookie({
        name: 'auth_token',
        value: config.cookie!,
        domain: '.twitter.com',
      });

      const url = postUrl || 'https://twitter.com/notifications';
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // 等待评论加载
      await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });

      // 提取评论
      const comments = await page.evaluate(() => {
        const tweets = document.querySelectorAll('[data-testid="tweet"]');
        return Array.from(tweets).map(tweet => ({
          id: tweet.getAttribute('data-tweet-id') || '',
          author: tweet.querySelector('[data-testid="User-Name"]')?.textContent || '',
          content: tweet.querySelector('[data-testid="tweetText"]')?.textContent || '',
          timestamp: new Date(),
        }));
      });

      await page.close();

      return comments.filter(c => c.id && !this.processedComments.has(c.id))
        .map(c => ({
          ...c,
          platform: 'twitter' as const,
          type: classifyComment(c.content),
          replied: false,
        }));
    } catch (error) {
      console.error('[CommentManager] 获取 Twitter 评论失败:', error);
      return [];
    }
  }

  /**
   * 获取 Facebook 评论
   */
  async fetchFacebookComments(postUrl?: string): Promise<Comment[]> {
    const config = getPlatformConfig('facebook');
    if (!config.enabled || !config.cookie) {
      return [];
    }

    try {
      if (!this.browser) await this.init();
      const page = await this.browser!.newPage();

      await page.setCookie({
        name: 'c_user',
        value: config.cookie!,
        domain: '.facebook.com',
      });

      const url = postUrl || 'https://www.facebook.com/notifications';
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // 提取评论（简化版）
      const comments = await page.evaluate(() => {
        // 这里需要根据实际 Facebook 结构选择器调整
        return [];
      });

      await page.close();

      return comments.map(c => ({
        ...c,
        platform: 'facebook' as const,
        type: classifyComment(c.content),
        replied: false,
      }));
    } catch (error) {
      console.error('[CommentManager] 获取 Facebook 评论失败:', error);
      return [];
    }
  }

  /**
   * 生成回复内容
   */
  generateReply(comment: Comment, productInfo: { name: string; website: string }): string {
    const templates = {
      [CommentType.INQUIRY]: [
        `感谢关注！${productInfo.name} 可以帮你解决这个问题。了解更多：${productInfo.website}`,
        `好问题！我们专门设计了功能来处理这种情况。欢迎试用：${productInfo.website}`,
      ],
      [CommentType.SUPPORT]: [
        `抱歉遇到问题！请私信我们详情，团队会尽快帮你解决。`,
        `感谢反馈！请发邮件到 support@xxx.com，我们会详细帮你排查。`,
      ],
      [CommentType.BUSINESS]: [
        `感谢兴趣！请发邮件到 business@xxx.com，我们会安排专人与您对接。`,
        `欢迎合作！请私信详聊，期待与您合作！`,
      ],
      [CommentType.NEGATIVE]: [
        `非常抱歉给您带来不好的体验。请私信我们详情，我们会全力解决并给您补偿。`,
        `感谢您的反馈，这帮助我们改进。请给我们一个补偿的机会，私信联系您。`,
      ],
      [CommentType.INTERACTION]: [
        `感谢支持！🙏`,
        `哈哈，说到心坎里了！`,
        `谢谢！也祝你一切顺利！`,
      ],
    };

    const typeTemplates = templates[comment.type || CommentType.INTERACTION];
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  }

  /**
   * 回复评论
   */
  async replyToComment(comment: Comment, replyText?: string): Promise<ReplyResult> {
    if (this.processedComments.has(comment.id)) {
      return { success: false, error: '评论已处理' };
    }

    try {
      if (!this.browser) await this.init();
      const page = await this.browser!.newPage();

      // 根据平台处理
      if (comment.platform === 'twitter') {
        const config = getPlatformConfig('twitter');
        await page.setCookie({
          name: 'auth_token',
          value: config.cookie!,
          domain: '.twitter.com',
        });

        await page.goto(`https://twitter.com/i/status/${comment.id}`, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });

        // 找到回复框并输入
        const replyBox = await page.$('[data-testid="tweetTextarea_0"]');
        if (!replyBox) {
          return { success: false, error: '找不到回复框' };
        }

        const reply = replyText || this.generateReply(comment, {
          name: '产品名',
          website: 'https://example.com',
        });

        await replyBox.type(reply, { delay: 50 });

        // 点击回复按钮
        const replyButton = await page.$('[data-testid="tweetButton"]');
        if (replyButton) {
          await replyButton.click();
          this.processedComments.add(comment.id);
          return { success: true };
        }

        return { success: false, error: '找不到回复按钮' };
      }

      // 其他平台类似实现...
      return { success: false, error: '平台不支持' };
    } catch (error) {
      console.error('[CommentManager] 回复评论失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取评论日报
   */
  async getDailyReport(): Promise<{
    total: number;
    byType: Record<CommentType, number>;
    replied: number;
    pending: number;
  }> {
    // 从存储中获取今日评论统计
    return {
      total: 0,
      byType: {
        [CommentType.INQUIRY]: 0,
        [CommentType.SUPPORT]: 0,
        [CommentType.BUSINESS]: 0,
        [CommentType.NEGATIVE]: 0,
        [CommentType.INTERACTION]: 0,
      },
      replied: 0,
      pending: 0,
    };
  }
}

export default CommentManager;
