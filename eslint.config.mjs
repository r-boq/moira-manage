import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  // ----------------------------------------------------------------
  // 规则集：Airbnb → TS → Next.js → Prettier（必须最后，覆盖格式规则）
  // ----------------------------------------------------------------
  ...compat.extends(
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'next/core-web-vitals',
    'next/typescript',
    'prettier', // 禁用所有与 Prettier 冲突的 ESLint 格式规则
  ),

  // ----------------------------------------------------------------
  // 全局配置
  // ----------------------------------------------------------------
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      // 让 eslint-plugin-import 能解析 tsconfig paths 别名
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // ---- React ----
      // Next.js 不需要手动 import React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // JSX 只允许出现在 .tsx 文件
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      // TS 已通过类型推断处理 defaultProps，不再需要
      'react/require-default-props': 'off',
      // antd 组件经常需要 prop spreading
      'react/jsx-props-no-spreading': 'off',
      // 命名组件用函数声明，匿名组件用箭头函数
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],

      // ---- TypeScript ----
      // 强制使用 import type 导入纯类型
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // 未使用变量报错，但 _ 前缀的忽略
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // any 给警告而非错误，store-factory 等底层工具偶尔需要
      '@typescript-eslint/no-explicit-any': 'warn',
      // 允许空函数（如 noop 回调）
      '@typescript-eslint/no-empty-function': 'warn',

      // ---- Import ----
      // 允许 named export 为主，不强制 default export
      'import/prefer-default-export': 'off',
      // import 分组排序
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            { pattern: 'react',         group: 'external',  position: 'before' },
            { pattern: 'next/**',       group: 'external',  position: 'before' },
            { pattern: '@/**',          group: 'internal',  position: 'before' },
            { pattern: '@components/**', group: 'internal', position: 'before' },
            { pattern: '@shared/**',    group: 'internal',  position: 'before' },
            { pattern: '@core/**',      group: 'internal',  position: 'before' },
            { pattern: '@features/**',  group: 'internal',  position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // ---- 其他 ----
      // console.log 在生产代码中给警告
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'group', 'groupEnd'] }],
    },
  },

  // ----------------------------------------------------------------
  // Next.js App Router：page / layout / route 文件必须 default export
  // ----------------------------------------------------------------
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // ----------------------------------------------------------------
  // features 入口文件允许 default export（暴露给 app/*/page.tsx）
  // ----------------------------------------------------------------
  {
    files: ['src/features/**/index.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
];

export default eslintConfig;
