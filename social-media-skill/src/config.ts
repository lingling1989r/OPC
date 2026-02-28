/**
 * 配置管理模块
 * 加载和管理 Skill 配置
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ProductConfig {
  name: string;
  website: string;
  oneLiner: string;
  targetUsers: string[];
  features: string[];
  pricing: {
    free: string;
    pro: string;
  };
  cases: Array<{ user: string; result: string }>;
}

export interface PlatformConfig {
  enabled: boolean;
  username?: string;
  cookie?: string;
  pageId?: string;
  appId?: string;
  appSecret?: string;
}

export interface ScheduleConfig {
  postTime: string;
  timezone: string;
  dailyPosts: {
    twitter: number;
    facebook: number;
    wechat: number;
  };
}

export interface EngagementConfig {
  dailySearches: {
    twitter: number;
    facebook: number;
    wechat: number;
  };
  keywords: string[];
}

export interface Config {
  product: ProductConfig;
  platforms: {
    twitter: PlatformConfig;
    facebook: PlatformConfig;
    wechat: PlatformConfig;
  };
  schedule: ScheduleConfig;
  engagement: EngagementConfig;
}

const DEFAULT_CONFIG: Config = {
  product: {
    name: 'Your Product',
    website: 'https://yourproduct.com',
    oneLiner: 'Help [target users] solve [core pain point]',
    targetUsers: ['Developer', 'Startup Founder'],
    features: ['Feature 1', 'Feature 2'],
    pricing: {
      free: 'Free tier available',
      pro: '$9.99/month',
    },
    cases: [],
  },
  platforms: {
    twitter: { enabled: false },
    facebook: { enabled: false },
    wechat: { enabled: false },
  },
  schedule: {
    postTime: '09:00',
    timezone: 'Asia/Shanghai',
    dailyPosts: {
      twitter: 3,
      facebook: 1,
      wechat: 1,
    },
  },
  engagement: {
    dailySearches: {
      twitter: 10,
      facebook: 5,
      wechat: 5,
    },
    keywords: [],
  },
};

let config: Config | null = null;

/**
 * 加载配置文件
 */
export function loadConfig(configPath?: string): Config {
  if (config) {
    return config;
  }

  const pathsToTry = [
    configPath,
    path.join(process.cwd(), 'config.json'),
    path.join(process.cwd(), 'config.json.example'),
    path.join(process.env.HOME || '', '.openclaw', 'skills', 'openclaw-social-media', 'config.json'),
  ].filter(Boolean) as string[];

  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf-8');
        config = { ...DEFAULT_CONFIG, ...JSON.parse(content) };
        console.log(`[Config] Loaded from ${p}`);
        return config;
      } catch (e) {
        console.warn(`[Config] Failed to parse ${p}: ${e}`);
      }
    }
  }

  console.warn('[Config] No config file found, using defaults');
  config = DEFAULT_CONFIG;
  return config;
}

/**
 * 保存配置
 */
export function saveConfig(newConfig: Config, configPath?: string): void {
  const pathToSave = configPath || path.join(process.cwd(), 'config.json');
  fs.writeFileSync(pathToSave, JSON.stringify(newConfig, null, 2));
  config = newConfig;
  console.log(`[Config] Saved to ${pathToSave}`);
}

/**
 * 获取产品配置
 */
export function getProductConfig(): ProductConfig {
  return loadConfig().product;
}

/**
 * 检查平台是否启用
 */
export function isPlatformEnabled(platform: 'twitter' | 'facebook' | 'wechat'): boolean {
  return loadConfig().platforms[platform].enabled;
}

/**
 * 获取平台配置
 */
export function getPlatformConfig(platform: 'twitter' | 'facebook' | 'wechat'): PlatformConfig {
  return loadConfig().platforms[platform];
}

/**
 * 验证配置完整性
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const cfg = loadConfig();
  const errors: string[] = [];

  // 产品配置验证
  if (!cfg.product.name || cfg.product.name === 'Your Product') {
    errors.push('请配置产品名称 (product.name)');
  }
  if (!cfg.product.website || cfg.product.website === 'https://yourproduct.com') {
    errors.push('请配置产品官网 (product.website)');
  }
  if (!cfg.product.oneLiner || cfg.product.oneLiner.includes('[target users]')) {
    errors.push('请配置产品一句话介绍 (product.oneLiner)');
  }

  // 至少启用一个平台
  const enabledPlatforms = Object.entries(cfg.platforms).filter(
    ([, v]) => v.enabled
  );
  if (enabledPlatforms.length === 0) {
    errors.push('请至少启用一个平台 (twitter/facebook/wechat)');
  }

  // 启用的平台需要配置凭证
  for (const [platform, pConfig] of Object.entries(cfg.platforms)) {
    if (pConfig.enabled) {
      if (platform === 'twitter' && !pConfig.cookie) {
        errors.push('Twitter 已启用但未配置 cookie');
      }
      if (platform === 'facebook' && !pConfig.cookie) {
        errors.push('Facebook 已启用但未配置 cookie');
      }
      if (platform === 'wechat' && (!pConfig.appId || !pConfig.appSecret)) {
        errors.push('微信公众号已启用但未配置 appId 或 appSecret');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  loadConfig,
  saveConfig,
  getProductConfig,
  isPlatformEnabled,
  getPlatformConfig,
  validateConfig,
};
