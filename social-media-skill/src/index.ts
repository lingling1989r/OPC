/**
 * OpenClaw 社交媒体营销自动化 Skill
 * 主入口文件
 */

import Publisher from './publisher';
import CommentManager from './comment-manager';
import EngagementManager from './engagement';
import Analytics from './analytics';
import { loadConfig, validateConfig } from './config';

/**
 * 社交媒体营销 Skill 主类
 */
export class SocialMediaSkill {
  private publisher: Publisher;
  private commentManager: CommentManager;
  private engagementManager: EngagementManager;
  private analytics: Analytics;
  private initialized: boolean = false;

  constructor() {
    this.publisher = new Publisher();
    this.commentManager = new CommentManager();
    this.engagementManager = new EngagementManager();
    this.analytics = new Analytics();
  }

  /**
   * 初始化 Skill
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // 加载配置
    loadConfig();

    // 验证配置
    const validation = validateConfig();
    if (!validation.valid) {
      console.error('[SocialMediaSkill] 配置验证失败:');
      validation.errors.forEach(e => console.error(`  - ${e}`));
      throw new Error('配置验证失败');
    }

    // 初始化各模块
    await this.publisher.init();
    await this.commentManager.init();
    await this.engagementManager.init();

    this.initialized = true;
    console.log('[SocialMediaSkill] 初始化完成');
  }

  /**
   * 清理资源
   */
  async destroy(): Promise<void> {
    await this.publisher.close();
    await this.commentManager.close();
    await this.engagementManager.close();
    this.initialized = false;
    console.log('[SocialMediaSkill] 已清理');
  }

  /**
   * 发布内容
   */
  async publish(content: string, platforms?: string[]): Promise<void> {
    if (!this.initialized) await this.init();

    const targetPlatforms = platforms || ['twitter', 'facebook', 'wechat'];
    
    for (const platform of targetPlatforms) {
      console.log(`[SocialMediaSkill] 发布到 ${platform}...`);
      // 调用 publisher 发布
    }
  }

  /**
   * 检查并回复评论
   */
  async checkAndReplyComments(): Promise<void> {
    if (!this.initialized) await this.init();

    console.log('[SocialMediaSkill] 检查新评论...');
    // 获取各平台评论并回复
  }

  /**
   * 执行互动任务
   */
  async doEngagement(keywords: string[]): Promise<void> {
    if (!this.initialized) await this.init();

    console.log('[SocialMediaSkill] 执行互动任务...');
    // 搜索并互动
  }

  /**
   * 生成周报
   */
  async generateWeeklyReport(): Promise<string> {
    const report = this.analytics.generateWeeklyReport();
    return this.analytics.exportReportMarkdown(report, `weekly-${report.weekStart}`);
  }
}

// OpenClaw Skill 入口
async function handleCommand(command: string, args: any[]): Promise<any> {
  const skill = new SocialMediaSkill();

  try {
    await skill.init();

    switch (command) {
      case 'publish':
        await skill.publish(args[0], args[1]);
        return { success: true, message: '发布完成' };

      case 'check-comments':
        await skill.checkAndReplyComments();
        return { success: true, message: '评论检查完成' };

      case 'engage':
        await skill.doEngagement(args[0]);
        return { success: true, message: '互动完成' };

      case 'weekly-report':
        const report = await skill.generateWeeklyReport();
        return { success: true, report };

      default:
        return { success: false, error: '未知命令' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '执行失败',
    };
  } finally {
    await skill.destroy();
  }
}

// 导出给 OpenClaw 使用
export { handleCommand };
export default SocialMediaSkill;

// CLI 入口
if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  handleCommand(command, args)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
