# OpenClaw 社交媒体营销自动化 Skill

## 项目目标
为出海独立开发者创建一个 OpenClaw Skill，自动化运营 X (Twitter)、Facebook、微信公众号三大渠道。

## 核心功能

### 1. 内容发布 (Publisher)
- 定时发布内容到 X/Twitter
- 定时发布内容到 Facebook
- 定时发布内容到微信公众号
- 支持审核工作流（生成→审核→发布）

### 2. 评论管理 (Comment Manager)
- 监控各平台新评论
- AI 自动生成回复
- 支持人工审核后发布
- 评论分类（咨询/支持/商务/负面/互动）

### 3. 主动互动 (Engagement)
- 搜索行业关键词
- 找到相关内容进行互动
- 点赞 + 评论（提供价值）
- 记录互动历史

### 4. 数据分析 (Analytics)
- 发布效果统计
- 互动数据统计
- 转化追踪
- 周报/月报生成

## 技术栈
- Node.js + TypeScript
- OpenClaw SDK
- Puppeteer/Playwright（浏览器自动化）
- 各平台 API（如可用）

## 项目结构
```
openclaw-social-media-skill/
├── README.md
├── SKILL.md
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # 主入口
│   ├── publisher.ts      # 内容发布
│   ├── comment-manager.ts # 评论管理
│   ├── engagement.ts     # 主动互动
│   ├── analytics.ts      # 数据分析
│   └── config.ts         # 配置
├── templates/
│   ├── post-templates.md  # 发布模板
│   └── reply-templates.md # 回复模板
└── examples/
    └── usage.md          # 使用示例
```

## 配置要求
用户需要提供：
1. 产品官网地址
2. 产品一句话介绍
3. 目标用户画像
4. 核心功能列表
5. 定价信息
6. 3-5 个用户案例
7. 各平台账号（X/FB/公众号）
