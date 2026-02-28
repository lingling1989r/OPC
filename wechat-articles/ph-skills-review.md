# Product Hunt 打榜还在手动操作？这31个 AI Skills 让你轻松上榜首！

> 独立开发者的 Product Hunt  Launch 指南

---

## 📌 写在前面

Product Hunt 打榜有多难？

- 选错日子，算法直接把你埋了
- 一个不小心，账号被 shadowban
- 不会写 tagline，转化率低到哭
- 手动发邮件、回复评论，累到怀疑人生

今天给你介绍一个神器 —— **producthunt-skills**，31 个 AI Agent Skills，帮你搞定 PH 打榜全流程！

---

## 🔥 producthunt-skills 是什么？

GitHub：https://github.com/yoanbernabeu/producthunt-skills

> 🚀 31 AI Agent Skills for Product Hunt launches. Expert guidance for strategy, content, marketing, compliance & more.

**支持的主流 AI Agent：**
- Claude Code
- Cursor
- Codex
- OpenCode
- Windsurf
- 等等 30+ AI agents

**安装方式：**
```bash
# 安装全部 31 个 skills
npx skills add yoanbernabeu/producthunt-skills

# 只安装策略类 skills
npx skills add yoanbernabeu/producthunt-skills --skill ph-launch-strategy
```

---

## 📦 31 个 Skills 全面解析

### 一、策略规划 (3个)

| Skill | 功能 |
|-------|------|
| **ph-launch-strategy** | 定义目标，创建 4-6 周时间线 |
| **ph-competitor-analysis** | 分析竞品发布，benchmark 顶级玩家 |
| **ph-timing-optimizer** | 选择最佳发布日子和时间 |

💡 **使用场景：**
> "什么时候发布最适合我的产品？"
> 
> 运行 `ph-timing-optimizer`，AI 会分析你的目标用户活跃时间、竞争对手发布时间历史，给你最佳建议。

---

### 二、内容创作 (6个)

| Skill | 功能 |
|-------|------|
| **ph-tagline-writer** | 写出 60 字以内的吸引人 tagline |
| **ph-description-writer** | 写转化的描述（AIDA/PAS/FAB 框架）|
| **ph-maker-comment** | 写出真实的第一条评论 |
| **ph-thumbnail-creator** | 设计抓眼球的缩略图和 GIF |
| **ph-gallery-assets** | 构建吸引人的图片画廊 |
| **ph-video-demo** | 脚本和结构化演示视频（30-60秒）|

💡 **使用场景：**
> "我的 tagline 太烂了，求优化！"
> 
> 运行 `ph-tagline-writer`，AI 会结合你的产品特点，写出多个 tagline 备选。

---

### 三、营销推广 (4个)

| Skill | 功能 |
|-------|------|
| **ph-email-strategy** | 规划跨时区的邮件波次 |
| **ph-social-media-launch** | 协调 Twitter/LinkedIn/Facebook |
| **ph-community-outreach** | Reddit、Indie Hackers、HN 互动 |
| **ph-supporter-network** | 建立和激活你的支持者网络 |

💡 **真实案例：**
> "我想在 Reddit r/indiehackers 宣传，但怕被删帖"
> 
> 运行 `ph-community-outreach`，AI 会告诉你：
> - 哪些子版块适合
> - 怎么写不违规
> - 最佳发布时间

---

### 四、发布日执行 (3个)

| Skill | 功能 |
|-------|------|
| **ph-launch-day-checklist** | 每小时执行计划 |
| **ph-comment-responder** | 快速回复评论（<9分钟）|
| **ph-real-time-monitor** | 实时追踪和调整 |

💡 **发布日 Checklist：**
```
🕐 12:01 AM PST - 准时发布
🕐 前 4 小时 - 关键期，全力互动
🕐 每隔 1 小时 - 检查排名，调整策略
🕐 24 小时内 - 回复每一条评论
```

---

### 五、合规避坑 (3个)

| Skill | 功能 |
|-------|------|
| **ph-ban-prevention** | 避免 shadowban 和处罚 |
| **ph-algorithm-guide** | 理解排名因素 |
| **ph-safe-messaging** | 使用批准的语言模式 |

⚠️ **重要规则（必看）：**
- ❌ 永远不要直接要 upvotes
- ✅ 改成要 "support" 或 "feedback"
- ❌ 违规 = 被 ban

---

### 六、猎人合作 (2个)

| Skill | 功能 |
|-------|------|
| **ph-hunter-finder** | 找到并联系顶级猎人 |
| **ph-profile-optimizer** | 打造 maker 声誉 |

💡 **为什么重要？**
- 好猎人 = 更多曝光
- 顶级猎人单日带来 1000+ votes

---

### 七、定价策略 (2个)

| Skill | 功能 |
|-------|------|
| **ph-launch-offers** | 创建 PH 专属优惠 |
| **ph-pricing-psychology** | 利用 FOMO 和紧迫感 |

💡 **定价心理学：**
- 限时优惠创造紧迫感
- PH 专属折扣吸引行动

---

### 八、数据分析 (2个)

| Skill | 功能 |
|-------|------|
| **ph-analytics-setup** | 配置追踪工具 |
| **ph-conversion-tracking** | 衡量发布效果和 ROI |

---

### 九、发布后运营 (4个)

| Skill | 功能 |
|-------|------|
| **ph-post-launch-followup** | 感谢支持者，收集评价 |
| **ph-content-recycling** | 复用发布素材 |
| **ph-relaunch-strategy** | 规划下次发布（v2.0）|
| **ph-seo-benefits** | 最大化 PH 反向链接 SEO 价值 |

---

### 十、奖项策略 (2个)

| Skill | 功能 |
|-------|------|
| **ph-newsletter-pitch** | 投稿到 PH 周报 |
| **ph-golden-kitty** | Golden Kitty 奖项策略 |

---

## 🚀 怎么使用？

### 方式一：命令行安装

```bash
# 安装全部 31 个 skills
npx skills add yoanbernabeu/producthunt-skills

# 查看所有 skills 列表
npx skills add yoanbernabeu/producthunt-skills --list
```

### 方式二：直接问 AI

安装完成后，直接对你的 AI Agent 说：

```
"Help me plan my Product Hunt launch"

"Write a tagline for my SaaS product"

"Create a launch day checklist"

"Check if my email is PH-compliant"

"When is the best day to launch?"
```

---

## 💎 结合 OpenClaw/Clawbolt

虽然这些 Skills 主要面向 Claude Code/Cursor 等 AI 工具，但我们可以用 OpenClaw 实现类似功能！

### 可以自动化的部分：

| 功能 | 实现方式 |
|------|----------|
| 定时抓取竞品数据 | Clawbolt 浏览器自动化 |
| 自动发布社交媒体 | OpenClaw 多渠道集成 |
| 评论监控和回复 | AI Agent + 自动化 |
| 数据追踪和报告 | 定时任务 + 分析 |

---

## 📊 总结

**producthunt-skills 适合谁？**

- ✅ 第一次上 PH 的小白
- ✅ 想系统化打榜的老手
- ✅ 没有团队的独立开发者
- ✅ 时间有限的 maker

**核心价值：**
- 31 个 Skills 覆盖打榜全流程
- 不需要再踩坑
- AI 帮你做决策

**免费使用，GitHub 4.3k+ stars**

---

## 📎 相关资源

- GitHub：https://github.com/yoanbernabeu/producthunt-skills
- PH Launch Guide：https://www.producthunt.com/launch
- PH Help Center：https://help.producthunt.com

---

**祝你的产品 PH 打榜成功！🚀**

如果觉得有帮助，欢迎转发分享！

---

*本文首发于 [公众号：xxx]*
*参考来源：producthunt-skills GitHub*
