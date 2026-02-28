/**
 * 数据分析模块
 * 统计发布效果、互动数据、转化追踪
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

export interface PostStats {
  platform: string;
  posts: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  conversions: number;
}

export interface DailyStats {
  date: string;
  posts: PostStats[];
  newFollowers: number;
  totalFollowers: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  summary: {
    totalPosts: number;
    totalImpressions: number;
    totalEngagement: number;
    engagementRate: number;
    newFollowers: number;
    conversions: number;
  };
  topPosts: Array<{
    platform: string;
    content: string;
    engagement: number;
    url?: string;
  }>;
  byPlatform: Record<string, PostStats>;
  recommendations: string[];
}

/**
 * 数据分析器
 */
export class Analytics {
  private statsHistory: DailyStats[] = [];
  private reportDir: string;

  constructor(reportDir: string = './reports') {
    this.reportDir = reportDir;
  }

  /**
   * 记录每日数据
   */
  recordDailyStats(stats: DailyStats): void {
    this.statsHistory.push(stats);
    this.saveStats();
  }

  /**
   * 保存统计数据
   */
  private saveStats(): void {
    const filePath = join(this.reportDir, 'stats.json');
    writeFileSync(filePath, JSON.stringify(this.statsHistory, null, 2));
  }

  /**
   * 生成周报
   */
  generateWeeklyReport(): WeeklyReport {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekStats = this.statsHistory.filter(
      s => new Date(s.date) >= weekAgo && new Date(s.date) <= now
    );

    // 汇总数据
    const summary = {
      totalPosts: weekStats.reduce((sum, s) => sum + s.posts.reduce((p, ps) => p + ps.posts, 0), 0),
      totalImpressions: weekStats.reduce((sum, s) => sum + s.posts.reduce((p, ps) => p + ps.impressions, 0), 0),
      totalEngagement: weekStats.reduce((sum, s) => sum + s.posts.reduce((p, ps) => p + ps.likes + ps.comments + ps.shares, 0), 0),
      engagementRate: 0,
      newFollowers: weekStats.reduce((sum, s) => sum + s.newFollowers, 0),
      conversions: weekStats.reduce((sum, s) => sum + s.posts.reduce((p, ps) => p + ps.conversions, 0), 0),
    };

    summary.engagementRate = summary.totalImpressions > 0
      ? (summary.totalEngagement / summary.totalImpressions * 100).toFixed(2) + '%'
      : '0%';

    // 按平台汇总
    const byPlatform: Record<string, PostStats> = {};
    weekStats.forEach(s => {
      s.posts.forEach(ps => {
        if (!byPlatform[ps.platform]) {
          byPlatform[ps.platform] = { ...ps };
        } else {
          byPlatform[ps.platform].posts += ps.posts;
          byPlatform[ps.platform].impressions += ps.impressions;
          byPlatform[ps.platform].likes += ps.likes;
          byPlatform[ps.platform].comments += ps.comments;
          byPlatform[ps.platform].shares += ps.shares;
          byPlatform[ps.platform].clicks += ps.clicks;
          byPlatform[ps.platform].conversions += ps.conversions;
        }
      });
    });

    // 生成建议
    const recommendations: string[] = [];
    
    if (summary.engagementRate.replace('%', '') as unknown as number < 2) {
      recommendations.push('互动率较低，建议增加有价值的内容比例');
    }
    if (byPlatform['twitter']?.posts < 3) {
      recommendations.push('Twitter 发布频率不足，建议每日至少 3 条');
    }
    if (summary.conversions === 0) {
      recommendations.push('暂无转化数据，建议在内容中增加 CTA');
    }

    return {
      weekStart: weekAgo.toISOString().split('T')[0],
      weekEnd: now.toISOString().split('T')[0],
      summary,
      topPosts: [], // 需要从具体帖子数据中获取
      byPlatform,
      recommendations,
    };
  }

  /**
   * 生成月报
   */
  generateMonthlyReport(): WeeklyReport & { month: string } {
    const weeklyReport = this.generateWeeklyReport();
    const now = new Date();
    
    return {
      ...weeklyReport,
      month: now.toISOString().slice(0, 7),
    };
  }

  /**
   * 导出报告为 Markdown
   */
  exportReportMarkdown(report: WeeklyReport, filename: string): string {
    const md = `# 社交媒体运营周报

**周期**: ${report.weekStart} ~ ${report.weekEnd}

## 📊 数据概览

| 指标 | 数值 |
|------|------|
| 总发布数 | ${report.summary.totalPosts} |
| 总曝光 | ${report.summary.totalImpressions} |
| 总互动 | ${report.summary.totalEngagement} |
| 互动率 | ${report.summary.engagementRate} |
| 新增粉丝 | ${report.summary.newFollowers} |
| 转化数 | ${report.summary.conversions} |

## 📱 各平台表现

| 平台 | 发布数 | 曝光 | 点赞 | 评论 | 转发 | 转化 |
|------|--------|------|------|------|------|------|
${Object.entries(report.byPlatform).map(([p, s]) => 
  `| ${p} | ${s.posts} | ${s.impressions} | ${s.likes} | ${s.comments} | ${s.shares} | ${s.conversions} |`
).join('\n')}

## 💡 优化建议

${report.recommendations.map(r => `- ${r}`).join('\n')}

---
*报告生成时间: ${new Date().toISOString()}*
`;

    const filePath = join(this.reportDir, `${filename}.md`);
    writeFileSync(filePath, md);
    return md;
  }

  /**
   * 获取转化漏斗
   */
  getConversionFunnel(): {
    impressions: number;
    clicks: number;
    visits: number;
    signups: number;
    conversions: number;
  } {
    // 从统计数据中计算转化漏斗
    return {
      impressions: 0,
      clicks: 0,
      visits: 0,
      signups: 0,
      conversions: 0,
    };
  }
}

export default Analytics;
