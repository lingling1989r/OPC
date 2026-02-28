/**
 * 内容发布模块
 * 负责在 X (Twitter)、Facebook、微信公众号发布内容
 */

import * as puppeteer from 'puppeteer';
import { getPlatformConfig, getProductConfig, type PlatformConfig } from './config';

export interface PostContent {
  platform: 'twitter' | 'facebook' | 'wechat';
  content: string;
  images?: string[];
  link?: string;
  scheduledTime?: string;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

/**
 * 内容发布器
 */
export class Publisher {
  private browser: puppeteer.Browser | null = null;

  /**
   * 初始化浏览器
   */
  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  /**
   * 关闭浏览器
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 发布到 Twitter/X
   */
  async publishToTwitter(content: PostContent): Promise<PostResult> {
    const config = getPlatformConfig('twitter');
    
    if (!config.enabled) {
      return { success: false, error: 'Twitter 未启用' };
    }

    if (!config.cookie) {
      return { success: false, error: 'Twitter cookie 未配置' };
    }

    try {
      if (!this.browser) await this.init();
      const page = await this.browser!.newPage();

      // 设置 cookie 登录
      await page.setCookie({
        name: 'auth_token',
        value: config.cookie!,
        domain: '.twitter.com',
      });

      // 跳转到发推页面
      await page.goto('https://twitter.com/compose/tweet', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 输入内容
      const textarea = await page.$('[data-testid="tweetTextarea_0"]');
      if (!textarea) {
        return { success: false, error: '找不到输入框' };
      }
      await textarea.type(content.content, { delay: 50 });

      // 如果有链接，添加到内容中
      if (content.link) {
        await textarea.type(` ${content.link}`, { delay: 50 });
      }

      // 点击发布按钮
      const publishButton = await page.$('[data-testid="tweetButton"]');
      if (!publishButton) {
        return { success: false, error: '找不到发布按钮' };
      }
      await publishButton.click();

      // 等待发布完成
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

      const postUrl = page.url();
      const postId = postUrl.split('/').pop() || '';

      await page.close();

      console.log(`[Publisher] Twitter 发布成功：${postUrl}`);
      return {
        success: true,
        postId,
        postUrl,
      };
    } catch (error) {
      console.error('[Publisher] Twitter 发布失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 发布到 Facebook
   */
  async publishToFacebook(content: PostContent): Promise<PostResult> {
    const config = getPlatformConfig('facebook');
    
    if (!config.enabled) {
      return { success: false, error: 'Facebook 未启用' };
    }

    if (!config.cookie) {
      return { success: false, error: 'Facebook cookie 未配置' };
    }

    try {
      if (!this.browser) await this.init();
      const page = await this.browser!.newPage();

      // 设置 cookie 登录
      await page.setCookie({
        name: 'c_user',
        value: config.cookie!,
        domain: '.facebook.com',
      });

      // 跳转到主页
      await page.goto('https://www.facebook.com', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 找到发帖输入框
      const textarea = await page.$('[placeholder="你在想什么？"]');
      if (!textarea) {
        return { success: false, error: '找不到输入框' };
      }
      await textarea.type(content.content, { delay: 50 });

      // 如果有链接
      if (content.link) {
        await textarea.type(` ${content.link}`, { delay: 50 });
      }

      // 点击发布
      const publishButton = await page.$('[aria-label="发布"]');
      if (!publishButton) {
        return { success: false, error: '找不到发布按钮' };
      }
      await publishButton.click();

      // 等待发布完成
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

      await page.close();

      console.log('[Publisher] Facebook 发布成功');
      return { success: true };
    } catch (error) {
      console.error('[Publisher] Facebook 发布失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 发布到微信公众号
   */
  async publishToWechat(content: PostContent): Promise<PostResult> {
    const config = getPlatformConfig('wechat');
    
    if (!config.enabled) {
      return { success: false, error: '微信公众号未启用' };
    }

    // 微信公众号需要通过 API 或后台发布
    // 这里提供 API 方式的示例
    if (!config.appId || !config.appSecret) {
      return { success: false, error: '微信公众号凭证未配置' };
    }

    try {
      // 获取 access_token
      const tokenResponse = await fetch(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`
      );
      const tokenData = await tokenResponse.json();
      
      if (tokenData.errcode) {
        return { success: false, error: `获取 token 失败：${tokenData.errmsg}` };
      }

      const accessToken = tokenData.access_token;

      // 创建草稿
      const draftResponse = await fetch(
        `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articles: [
              {
                title: content.content.split('\n')[0] || '推文',
                content: content.content,
                thumb_media_id: 'thumb_id', // 需要上传缩略图
              },
            ],
          }),
        }
      );
      const draftData = await draftResponse.json();

      if (draftData.errcode) {
        return { success: false, error: `创建草稿失败：${draftData.errmsg}` };
      }

      console.log('[Publisher] 微信公众号草稿创建成功');
      return {
        success: true,
        postId: draftData.media_id,
      };
    } catch (error) {
      console.error('[Publisher] 微信公众号发布失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 发布到所有启用的平台
   */
  async publishToAll(content: Omit<PostContent, 'platform'>): Promise<Record<string, PostResult>> {
    const results: Record<string, PostResult> = {};

    const platforms = ['twitter', 'facebook', 'wechat'] as const;
    
    for (const platform of platforms) {
      const platformContent: PostContent = { ...content, platform };
      results[platform] = await this[`publishTo${platform.charAt(0).toUpperCase() + platform.slice(1)}`](platformContent);
    }

    return results;
  }

  /**
   * 生成发布内容（基于产品配置）
   */
  generatePostContent(type: 'intro' | 'tip' | 'case' | 'update'): string[] {
    const product = getProductConfig();
    const contents: string[] = [];

    switch (type) {
      case 'intro':
        contents.push(
          `🚀 介绍一个超棒的产品：${product.name}\n\n` +
          `${product.oneLiner}\n\n` +
          `核心功能：\n` +
          product.features.map((f, i) => `${i + 1}. ${f}`).join('\n') +
          `\n\n👉 ${product.website}`
        );
        break;

      case 'tip':
        contents.push(
          `💡 行业小技巧\n\n` +
          `做 [相关任务] 时，试试这个方法：\n\n` +
          `1. 第一步...\n` +
          `2. 第二步...\n` +
          `3. 第三步...\n\n` +
          `用 ${product.name} 可以自动完成这些！`
        );
        break;

      case 'case':
        if (product.cases.length > 0) {
          const caseItem = product.cases[Math.floor(Math.random() * product.cases.length)];
          contents.push(
            `📈 用户案例分享\n\n` +
            `${caseItem.user} 使用 ${product.name} 后：\n` +
            `"${caseItem.result}"\n\n` +
            `你也想达到这样的效果吗？\n` +
            `👉 ${product.website}`
          );
        }
        break;

      case 'update':
        contents.push(
          `✨ ${product.name} 更新啦！\n\n` +
          `新增了令人兴奋的功能...\n\n` +
          `立即体验：${product.website}`
        );
        break;
    }

    return contents;
  }
}

export default Publisher;
