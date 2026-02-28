/**
 * 主动互动模块
 * 搜索相关内容并进行互动，实现获客
 */

import * as puppeteer from 'puppeteer';
import { getPlatformConfig, getProductConfig } from './config';

export interface SearchResult {
  id: string;
  platform: 'twitter' | 'facebook' | 'wechat';
  author: string;
  content: string;
  url: string;
  timestamp?: Date;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface InteractionRecord {
  id: string;
  platform: string;
  url: string;
  action: 'like' | 'comment' | 'both';
  commentText?: string;
  timestamp: Date;
  result?: string;
}

/**
 * 互动策略
 */
export const INTERACTION_TEMPLATES = {
  valueAdd: (insight: string, productName: string) => `这篇讲得很好！补充一点：${insight}\n\n我们做 ${productName} 时也发现...`,
  
  problemSolve: (method: string, productName: string) => `这个问题我们遇到过，可以用 ${method} 解决。\n\n如果嫌麻烦，${productName} 可以自动处理...`,
  
  alternative: (competitor: string, productName: string, problem: string) => `理解你的痛点！我们之前也用 ${competitor}，后来自己做了 ${productName}，解决了 ${problem}...`,
  
  encouragement: () => `加油！这个方向很有前景！👍`,
  
  question: (question: string) => `好问题！我也想知道答案，有了解的朋友麻烦分享一下~`,
};

/**
 * 主动互动管理器
 */
export class EngagementManager {
  private browser: puppeteer.Browser | null = null;
  private interactionHistory: InteractionRecord[] = [];
  private processedContent = new Set<string>();

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
   * 搜索 Twitter 相关内容
   */
  async searchTwitter(keywords: string[], limit: number = 10): Promise<SearchResult[]> {
    const config = getPlatformConfig('twitter');
    if (!config.enabled || !config.cookie) {
      return [];
    }

    const results: SearchResult[] = [];

    try {
      if (!this.browser) await this.init();
      const page = await this.browser!.newPage();

      await page.setCookie({
        name: 'auth_token',
        value: config.cookie!,
        domain: '.twitter.com',
      });

      for (const keyword of keywords.slice(0, 3)) {
        if (results.length >= limit) break;

        const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(keyword)}&f=live`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // 等待搜索结果加载
        await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });

        const searchResults = await page.evaluate((kw) => {
          const tweets = document.querySelectorAll('[data-testid="tweet"]');
          return Array.from(tweets).slice(0, 5).map(tweet => {
            const userElement = tweet.querySelector('[data-testid="User-Name"]');
            const textElement = tweet.querySelector('[data-testid="tweetText"]');
            const linkElement = tweet.querySelector('a[href*="/status/"]');
            
            return {
              id: tweet.getAttribute('data-tweet-id') || '',
              author: userElement?.textContent || '',
              content: textElement?.textContent || '',
              url: linkElement?.getAttribute('href') || '',
              timestamp: new Date(),
            };
          });
        }, keyword);

        results.push(...searchResults.filter(r => r.id && r.content));
      }

      await page.close();

      // 过滤已处理的内容
      return results.filter(r => !this.processedContent.has(r.id)).slice(0, limit);
    } catch (error) {
      console.error('[Engagement] Twitter 搜索失败:', error);
      return [];
    }
  }

  /**
   * 搜索微信公众号文章
   */
  async searchWechat(keywords: string[], limit: number = 5): Promise<SearchResult[]> {
    // 微信公众号搜索需要通过搜狗微信或第三方 API
    // 这里提供简化版本
    console.log('[Engagement] 微信公众号搜索需要通过搜狗微信搜索实现');
    return [];
  }

  /**
   * 搜索 Facebook 内容
   */
  async searchFacebook(keywords: string[], limit: number = 5): Promise<SearchResult[]> {
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

      const results: SearchResult[] = [];

      for (const keyword of keywords.slice(0, 2)) {
        if (results.length >= limit) break;

        const searchUrl = `https://www.facebook.com/search/posts/?q=${encodeURIComponent(keyword)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // 提取搜索结果
        const searchResults = await page.evaluate(() => {
          // 根据实际 Facebook 结构选择器调整
          return [];
        });

        results.push(...searchResults);
      }

      await page.close();
      return results.slice(0, limit);
    } catch (error) {
      console.error('[Engagement] Facebook 搜索失败:', error);
      return [];
    }
  }

  /**
   * 点赞内容
   */
  async likeContent(searchResult: SearchResult): Promise<boolean> {
    try {
      if (!this.browser) await this.init();
      const page = await this.browser!.newPage();

      if (searchResult.platform === 'twitter') {
        const config = getPlatformConfig('twitter');
        await page.setCookie({
          name: 'auth_token',
          value: config.cookie!,
          domain: '.twitter.com',
        });

        await page.goto(searchResult.url, { waitUntil: 'networkidle2', timeout: 30000 });

        // 点击点赞按钮
        const likeButton = await page.$('[data-testid="like"]');
        if (likeButton) {
          await likeButton.click();
          this.recordInteraction(searchResult, 'like');
          return true;
        }
      }

      await page.close();
      return false;
    } catch (error) {
      console.error('[Engagement] 点赞失败:', error);
      return false;
    }
  }

  /**
   * 评论互动
   */
  async commentOnContent(searchResult: SearchResult, templateType: 'valueAdd' | 'problemSolve' | 'alternative' | 'encouragement' | 'question', customData?: any): Promise<boolean> {
    try {
      if (!this.browser) await this.init();
      const page = await this.browser!.newPage();

      if (searchResult.platform === 'twitter') {
        const config = getPlatformConfig('twitter');
        await page.setCookie({
          name: 'auth_token',
          value: config.cookie!,
          domain: '.twitter.com',
        });

        await page.goto(searchResult.url, { waitUntil: 'networkidle2', timeout: 30000 });

        // 生成回复内容
        const product = getProductConfig();
        let commentText = '';

        switch (templateType) {
          case 'valueAdd':
            commentText = INTERACTION_TEMPLATES.valueAdd('行业洞察', product.name);
            break;
          case 'problemSolve':
            commentText = INTERACTION_TEMPLATES.problemSolve('具体方法', product.name);
            break;
          case 'alternative':
            commentText = INTERACTION_TEMPLATES.alternative('竞品名', product.name, '具体问题');
            break;
          case 'encouragement':
            commentText = INTERACTION_TEMPLATES.encouragement();
            break;
          case 'question':
            commentText = INTERACTION_TEMPLATES.question('相关问题');
            break;
        }

        // 找到回复框并输入
        const replyBox = await page.$('[data-testid="tweetTextarea_0"]');
        if (replyBox) {
          await replyBox.type(commentText, { delay: 50 });
          
          const replyButton = await page.$('[data-testid="tweetButton"]');
          if (replyButton) {
            await replyButton.click();
            this.recordInteraction(searchResult, 'comment', commentText);
            return true;
          }
        }
      }

      await page.close();
      return false;
    } catch (error) {
      console.error('[Engagement] 评论失败:', error);
      return false;
    }
  }

  /**
   * 执行互动任务
   */
  async executeEngagementTask(keywords: string[], targets: { twitter: number; facebook: number; wechat: number }): Promise<{
    searched: number;
    liked: number;
    commented: number;
  }> {
    const stats = { searched: 0, liked: 0, commented: 0 };

    // Twitter 互动
    if (targets.twitter > 0) {
      const twitterResults = await this.searchTwitter(keywords, targets.twitter * 2);
      stats.searched += twitterResults.length;

      for (const result of twitterResults.slice(0, targets.twitter)) {
        // 随机决定互动方式
        const action = Math.random();
        if (action > 0.7) {
          // 点赞 + 评论
          await this.likeContent(result);
          await this.commentOnContent(result, 'valueAdd');
          stats.liked++;
          stats.commented++;
        } else if (action > 0.4) {
          // 只点赞
          await this.likeContent(result);
          stats.liked++;
        } else {
          // 只评论
          await this.commentOnContent(result, 'encouragement');
          stats.commented++;
        }
      }
    }

    // Facebook 互动
    if (targets.facebook > 0) {
      const fbResults = await this.searchFacebook(keywords, targets.facebook * 2);
      stats.searched += fbResults.length;

      for (const result of fbResults.slice(0, targets.facebook)) {
        await this.likeContent(result);
        stats.liked++;
      }
    }

    return stats;
  }

  /**
   * 记录互动历史
   */
  private recordInteraction(result: SearchResult, action: 'like' | 'comment' | 'both', commentText?: string): void {
    this.interactionHistory.push({
      id: `${Date.now()}-${result.id}`,
      platform: result.platform,
      url: result.url,
      action,
      commentText,
      timestamp: new Date(),
    });
    this.processedContent.add(result.id);
  }

  /**
   * 获取互动周报
   */
  getWeeklyReport(): {
    totalInteractions: number;
    byPlatform: Record<string, number>;
    byAction: Record<string, number>;
    topKeywords: string[];
  } {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekHistory = this.interactionHistory.filter(r => r.timestamp > weekAgo);

    return {
      totalInteractions: weekHistory.length,
      byPlatform: {
        twitter: weekHistory.filter(r => r.platform === 'twitter').length,
        facebook: weekHistory.filter(r => r.platform === 'facebook').length,
        wechat: weekHistory.filter(r => r.platform === 'wechat').length,
      },
      byAction: {
        like: weekHistory.filter(r => r.action === 'like' || r.action === 'both').length,
        comment: weekHistory.filter(r => r.action === 'comment' || r.action === 'both').length,
      },
      topKeywords: [], // 需要从搜索记录中统计
    };
  }
}

export default EngagementManager;
