# 使用示例

## 快速开始

### 1. 配置产品

创建 `config.json`：

```json
{
  "product": {
    "name": "MySaaS",
    "website": "https://mysaas.com",
    "oneLiner": "帮助独立开发者自动化社交媒体运营",
    "targetUsers": ["独立开发者", "小团队", "创业者"],
    "features": [
      "自动发布内容到多平台",
      "AI 自动生成回复",
      "主动互动获客",
      "数据分析报告"
    ],
    "pricing": {
      "free": "免费版 - 每日 3 条发布",
      "pro": "$9.99/月 - 无限发布 + 高级功能"
    },
    "cases": [
      {"user": "开发者 A", "result": "3 个月获取 500+ 用户"},
      {"user": "创业者 B", "result": "月收入从$0 到$5000"}
    ]
  },
  "platforms": {
    "twitter": {
      "enabled": true,
      "username": "@mysaas",
      "cookie": "your_twitter_cookie"
    },
    "facebook": {
      "enabled": true,
      "pageId": "your_page_id",
      "cookie": "your_facebook_cookie"
    },
    "wechat": {
      "enabled": false
    }
  },
  "schedule": {
    "postTime": "09:00",
    "timezone": "Asia/Shanghai",
    "dailyPosts": {
      "twitter": 3,
      "facebook": 1,
      "wechat": 0
    }
  },
  "engagement": {
    "dailySearches": {
      "twitter": 10,
      "facebook": 5,
      "wechat": 0
    },
    "keywords": ["独立开发", "SaaS", "自动化", "效率工具"]
  }
}
```

### 2. 安装依赖

```bash
cd openclaw-social-media-skill
npm install
npm run build
```

### 3. 在 OpenClaw 中启用

```bash
openclaw skills enable openclaw-social-media-skill
```

---

## 常用命令

### 发布内容

```bash
# 发布一条推文
npx ts-node src/index.ts publish "今天发布的内容"

# 发布到所有平台
npx ts-node src/index.ts publish "今天发布的内容" '["twitter", "facebook"]'
```

### 检查评论

```bash
npx ts-node src/index.ts check-comments
```

### 执行互动

```bash
npx ts-node src/index.ts engage '["独立开发", "SaaS"]'
```

### 生成报告

```bash
npx ts-node src/index.ts weekly-report
```

---

## OpenClaw 对话示例

### 发布内容

```
@openclaw 发布一条关于产品更新的推文

好的，正在为你生成并发布内容...

✅ Twitter 发布成功：https://twitter.com/xxx/status/123
✅ Facebook 发布成功
```

### 检查评论

```
@openclaw 检查新评论

发现 5 条新评论：
- 产品咨询 x2 (已自动回复)
- 技术支持 x1 (已转人工)
- 一般互动 x2 (已自动回复)

详情见评论日报。
```

### 执行互动

```
@openclaw 今天搜索"独立开发"并互动

正在搜索相关内容...
找到 15 条相关内容

执行互动：
- 点赞 10 条
- 评论 5 条

互动完成！预计带来 2-3 个新用户。
```

### 查看报告

```
@openclaw 本周运营报告

📊 本周数据概览

| 指标 | 数值 |
|------|------|
| 总发布数 | 21 |
| 总曝光 | 15,230 |
| 总互动 | 432 |
| 互动率 | 2.84% |
| 新增粉丝 | 87 |
| 转化数 | 12 |

💡 优化建议
- 互动率良好，继续保持
- Twitter 发布频率可适当增加
- 建议在内容中增加更多 CTA
```

---

## 1 个月运营计划

### 第 1 周：认知建立

**目标**: 让目标用户知道你的产品

**每日任务**:
- 发布 1 条产品介绍
- 搜索互动 10 次
- 回复所有评论

**内容主题**:
- Day1: 产品发布
- Day2: 痛点共鸣
- Day3: 功能展示
- Day4: 团队故事
- Day5: 用户案例
- Day6: 行业观点
- Day7: 周末互动

### 第 2 周：价值输出

**目标**: 建立专业形象

**每日任务**:
- 发布 1 条干货内容
- 搜索互动 15 次
- 回复所有评论

**内容主题**:
- 行业技巧分享
- 经验总结
- 工具推荐
- 案例分析

### 第 3 周：转化引导

**目标**: 引导用户试用

**每日任务**:
- 发布 1 条带 CTA 的内容
- 搜索互动 20 次
- 主动私信潜在客户

**内容主题**:
- 限时优惠
- 免费试用
- 用户见证
- 对比竞品

### 第 4 周：成交转化

**目标**: 完成转化

**每日任务**:
- 发布 1 条案例/优惠内容
- 跟进潜在客户
- 回复所有咨询

**内容主题**:
- 成功案例
- 优惠倒计时
- FAQ 解答
- 感谢用户

---

## 常见问题

### Q: 发布失败怎么办？

A: 检查以下几点：
1. Cookie 是否过期（重新获取）
2. 网络是否正常
3. 内容是否违规（修改后重试）

### Q: 互动效果不好？

A: 优化互动策略：
1. 确保评论内容有价值
2. 不要硬广，先提供帮助
3. 选择相关性高的内容互动

### Q: 如何获取更多用户？

A: 多渠道获客：
1. 增加互动频率
2. 优化内容质量
3. 尝试付费推广
4. 寻求 KOL 合作

---

## 技术支持

遇到问题？
- GitHub Issues: https://github.com/lingling1989r/OPC/issues
- 傲雪社群：[社群链接]
