# Code Standards — 代码规范

基于 **Airbnb JavaScript/TypeScript 风格指南**，通过 ESLint + Prettier 自动化执行。

---

## 工具链

| 工具 | 版本 | 作用 |
|------|------|------|
| ESLint | ^8.57 | 代码质量检查（逻辑错误、规范违规） |
| eslint-config-airbnb | ^19 | Airbnb JS 规则集 |
| eslint-config-airbnb-typescript | ^18 | Airbnb TS 扩展规则 |
| eslint-config-prettier | ^9 | 禁用与 Prettier 冲突的 ESLint 规则 |
| Prettier | ^3 | 代码格式化（只管风格，不管逻辑） |
| Husky | ^9 | Git Hooks 管理 |
| lint-staged | ^15 | 仅对 staged 文件执行检查，提升速度 |

---

## Prettier 配置（`.prettierrc.json`）

```json
{
  "semi": true,           // ✅ 必须分号结尾
  "singleQuote": true,    // 字符串使用单引号
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,  // JSX 属性使用双引号
  "trailingComma": "all",   // 多行末尾逗号（包括函数参数）
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",  // 箭头函数参数始终加括号
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
```

**重要**：本项目**强制使用分号**，Prettier 会自动插入，ESLint 也会检查。

---

## ESLint 关键规则

### React

| 规则 | 配置 | 说明 |
|------|------|------|
| `react/react-in-jsx-scope` | off | Next.js 不需要手动 import React |
| `react/jsx-filename-extension` | `.tsx` only | JSX 只允许在 .tsx 文件 |
| `react/require-default-props` | off | TypeScript 已处理 |
| `react/jsx-props-no-spreading` | off | antd 组件常需要 spread |
| `react/function-component-definition` | 命名组件用函数声明 | `function Foo() {}` 而非箭头函数 |

### TypeScript

| 规则 | 配置 | 说明 |
|------|------|------|
| `@typescript-eslint/consistent-type-imports` | error | 纯类型导入必须用 `import type` |
| `@typescript-eslint/no-unused-vars` | error | 未使用变量报错，`_` 前缀例外 |
| `@typescript-eslint/no-explicit-any` | warn | 尽量避免 any |

### Import 排序

import 语句按以下顺序排列，组间空一行：

```ts
// 1. Node 内置
import path from 'path';

// 2. 外部依赖（react 和 next 最前）
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';

// 3. 内部路径别名
import { useAuthStore } from '@core/stores';
import { Button } from '@components/ui';
import { useAsync } from '@shared/hooks';

// 4. 相对路径
import { LoginForm } from './LoginForm';
import styles from './index.module.scss';
```

---

## 代码风格规范

### 组件定义

```tsx
// ✅ 命名组件用函数声明
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}

// ✅ 匿名组件（如回调）用箭头函数
const renderItem = (item: Item) => <li key={item.id}>{item.name}</li>;

// ❌ 不要用箭头函数定义命名组件
export const UserCard = ({ user }: UserCardProps) => { ... };
```

### 类型导入

```ts
// ✅ 纯类型用 import type
import type { User } from '@core/models';
import type { ApiResponse } from '@shared/types';

// ✅ 或内联 type
import { useAuthStore, type AuthState } from '@core/stores';
```

### 未使用变量

```ts
// ✅ 用 _ 前缀标记有意忽略的参数
function handler(_event: MouseEvent, value: string) {
  console.log(value);
}
```

### Console

```ts
// ✅ 允许
console.warn('...');
console.error('...');
console.info('...');

// ⚠️ console.log 会触发 ESLint warning，提交前清理
console.log('debug');
```

---

## 提交前检查流程

```
git commit
  └─ Husky: pre-commit
       └─ lint-staged
            ├─ *.{ts,tsx}
            │    ├─ eslint --fix --max-warnings=0
            │    └─ prettier --write
            └─ *.{scss,css,json,md,yml}
                 └─ prettier --write
```

- `--max-warnings=0`：有任何 warning 也会阻断提交
- 若自动修复后仍有错误，终端会显示具体位置，修复后重新 `git add` 再提交

---

## 手动执行检查

```bash
# 检查全部文件
pnpm lint

# 自动修复可修复的问题
pnpm lint:fix

# 检查格式（不修改文件，适合 CI）
pnpm format:check

# 格式化所有文件
pnpm format

# TypeScript 类型检查
pnpm type-check
```

---

## CI 集成建议

在 CI pipeline 中依次执行：

```bash
pnpm install --frozen-lockfile
pnpm type-check
pnpm lint
pnpm format:check
pnpm build
```
