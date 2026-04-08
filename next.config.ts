import path from 'path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [],
  },

  // SCSS 配置
  sassOptions: {
    // 允许直接 @use 'styles/variables' 等短路径（相对 src/）
    includePaths: [path.join(process.cwd(), 'src')],
    // 全局注入变量与混入，所有 .scss 文件可直接使用，无需手动 @use
    additionalData: `@use 'shared/styles/variables' as *; @use 'shared/styles/mixins' as *;`,
    // 抑制 sass 旧版 JS API 警告
    silenceDeprecations: ['legacy-js-api'],
  },

  env: {},
};

export default nextConfig;
