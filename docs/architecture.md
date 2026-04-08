# Architecture — 架构设计

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 15（App Router） |
| 语言 | TypeScript 5（strict 模式） |
| UI 组件库 | Ant Design 5 |
| 状态管理 | Zustand 5 + Immer |
| 样式 | SCSS Modules |
| 包管理 | pnpm |

---

## 目录结构

```
src/
├── app/                        # Next.js App Router 路由层（仅路由声明）
│   ├── layout.tsx              # 根布局，挂载 AntdRegistry
│   ├── globals.scss            # 全局样式入口
│   ├── page.tsx                # 首页 /
│   ├── dashboard/
│   │   └── page.tsx            # /dashboard
│   └── login/
│       └── page.tsx            # /login
│
├── features/                   # 业务模块层（每个子目录 = 一个业务模块）
│   ├── dashboard/
│   └── auth/
│
├── components/                 # 通用 UI 组件（与业务无关，可跨 feature 复用）
│   ├── ui/                     # 基础原子组件（re-export antd）
│   └── layout/                 # 布局组件（Header、Footer 等）
│
├── core/                       # 业务核心层（领域模型、服务调用、全局状态）
│   ├── models/                 # 前端领域模型（与后端 DTO 解耦）
│   ├── services/               # API 调用封装
│   └── stores/                 # 全局 Zustand stores
│
└── shared/                     # 通用基础设施（与业务、框架均无关）
    ├── constants/              # 全局常量
    ├── hooks/                  # 通用 React hooks
    ├── lib/                    # 第三方工具封装（http client 等）
    ├── store-factory/          # Zustand 工厂与中间件
    ├── styles/                 # SCSS 变量与混入
    ├── types/                  # 通用 TypeScript 类型
    └── utils/                  # 纯函数工具库
```

---

## 分层规范

### 依赖方向（单向，禁止反向）

```
app  →  features  →  core  →  shared
              ↓
          components  →  shared
```

- `app` 只负责路由声明，不包含任何业务逻辑
- `features` 可以依赖 `core`、`components`、`shared`，**禁止跨 feature 直接引用**
- `core` 可以依赖 `shared`，**禁止**依赖 `features` 或 `components`
- `shared` **不依赖任何**项目内其他层

### 各层职责对照

| 层 | 放什么 | 不放什么 |
|----|--------|---------|
| `app` | 路由文件、`layout.tsx`、`page.tsx` | 业务逻辑、组件实现 |
| `features` | 页面组件、业务 hooks、feature 内组件 | 跨业务复用的通用逻辑 |
| `components` | 可复用 UI 组件 | 直接调用 API、直接读写 store |
| `core/models` | 前端领域模型类型 | 后端 DTO 原样搬运 |
| `core/services` | fetch 调用、请求/响应转换 | UI 逻辑、状态更新 |
| `core/stores` | 全局 Zustand stores | 局部 UI 状态（用 useState） |
| `shared` | 纯函数、通用 hooks、类型、常量 | 任何业务含义 |

---

## 路径别名

在 `tsconfig.json` 中定义，可在任何文件中使用：

```ts
import { useAuthStore } from '@core/stores';
import { Button }       from '@components/ui';
import { useAsync }     from '@shared/hooks';
import { cn }           from '@shared/utils';
import DashboardPage    from '@features/dashboard';
```

| 别名 | 指向 |
|------|------|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@shared/*` | `src/shared/*` |
| `@core/*` | `src/core/*` |
| `@features/*` | `src/features/*` |
