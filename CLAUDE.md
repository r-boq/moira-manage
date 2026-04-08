# CLAUDE.md — Moira Manage 项目规则

本文件由 Claude Code 自动加载，**写代码前必须遵守以下所有规则**。

---

## 架构分层约束

依赖方向（单向，禁止反向或跨层）：

```
app → features → core → shared
           ↓
       components → shared
```

- `app/` 只放路由文件，不含业务逻辑
- `features/` 禁止跨 feature 直接引用
- `core/` 禁止依赖 `features/` 或 `components/`
- `shared/` 不依赖任何其他层

新增业务 store → `src/core/stores/`
新增业务 http service → `src/core/services/`，使用 `@core/lib` 的 `http` 实例

---

## 代码风格（ESLint Airbnb + Prettier）

**写代码时直接遵守，不要等 lint 报错再改。**

### Import 规范

```ts
// ✅ 正确顺序，组间空一行
import { useState } from 'react'; // 1. 外部依赖（react/next 最前）
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@core/stores'; // 2. 内部路径别名
import { Button } from '@components/ui';
import { useAsync } from '@shared/hooks';

import { LoginForm } from './LoginForm'; // 3. 相对路径
import styles from './index.module.scss';

// ✅ 纯类型用 import type
import type { User } from '@core/models';
import type { ApiResponse } from '@shared/types';
```

### TypeScript 规范

```ts
// ✅ 不用 Function 类型，写具体签名
type Handler = (...args: unknown[]) => unknown;

// ✅ 不用 for..in，用 Object.keys/values/entries
Object.keys(obj).forEach((key) => { ... });

// ✅ 不用 @ts-nocheck，用具体的 eslint-disable 注释
/* eslint-disable @typescript-eslint/no-explicit-any */

// ✅ 内联 require() 需要三个 disable 注释
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require
const { foo } = require('bar') as { foo: () => void };
```

### React 规范

```tsx
// ✅ 命名组件用函数声明
export function UserCard({ user }: Props) { ... }

// ❌ 不用箭头函数定义命名组件
export const UserCard = ({ user }: Props) => { ... };

// ✅ label 必须关联控件（htmlFor + id）
<label htmlFor="field-id">用户名</label>
<Input id="field-id" ... />

// ✅ immer draft 赋值需要 disable 注释
// eslint-disable-next-line no-param-reassign
draft.count += 1;
```

### features 出口文件

```ts
// ✅ 用 export default 语法（不用 export { X as default }）
import { DashboardPage } from './components/DashboardPage';
export default DashboardPage;
```

### Console

```ts
// ✅ 允许
console.warn / console.error / console.info / console.group / console.groupEnd

// ❌ 会触发 warning（--max-warnings=0 下等同于 error）
console.log(...)
```

---

## 样式规范

- 每个组件目录下放 `index.module.scss`
- 变量和混入**无需** `@use`，已通过 `additionalData` 自动注入
- 禁止内联样式（除非动态计算）

---

## 路径别名

| 别名            | 指向               |
| --------------- | ------------------ |
| `@/*`           | `src/*`            |
| `@components/*` | `src/components/*` |
| `@shared/*`     | `src/shared/*`     |
| `@core/*`       | `src/core/*`       |
| `@features/*`   | `src/features/*`   |

---

## 提交规范

- 提交前本地执行 `pnpm lint` 确认 0 errors 0 warnings
- 所有 `*.ts/tsx` 文件必须通过 `eslint --fix --max-warnings=0 --no-warn-ignored`

---

## 文档

详细设计文档见 `docs/` 目录：

- `docs/architecture.md` — 分层架构
- `docs/features.md` — 业务模块开发规范
- `docs/state-management.md` — Zustand store 使用指南
- `docs/styling.md` — SCSS 变量/混入参考
- `docs/code-standards.md` — 完整代码规范说明
