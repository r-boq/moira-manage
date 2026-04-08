# State Management — 状态管理

基于 **Zustand 5 + Immer** 实现，通过 `src/shared/store-factory` 提供统一的工厂函数。

---

## 三种创建模式

### 1. `createImmerStore`（推荐）

适合绝大多数业务场景。用声明式对象定义 state 和 actions，Immer 自动处理不可变更新。

```ts
import { createImmerStore } from '@shared/store-factory';

interface CounterState {
  count: number;
}

export const useCounterStore = createImmerStore({
  state: {
    count: 0,
  } as CounterState,

  actions: {
    // 直接修改 draft（Immer 模式）
    increment() {
      this.set((draft) => {
        draft.count += 1;
      });
    },
    // 或传入 Partial state（普通模式）
    reset() {
      this.set({ count: 0 });
    },
    // 读取当前状态
    incrementByAmount(amount: number) {
      const current = this.get().count;
      this.set({ count: current + amount });
    },
  },

  devtools: { name: 'CounterStore' },
});
```

### 2. `createSimpleStore`（函数式）

适合简单场景或从旧代码迁移。

```ts
import { createSimpleStore } from '@shared/store-factory';

export const useUIStore = createSimpleStore(
  { sidebarOpen: true, theme: 'system' as const },
  (set, get) => ({
    toggleSidebar: () => set((draft) => { draft.sidebarOpen = !draft.sidebarOpen; }),
    setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
  }),
  { devtools: { name: 'UIStore' } }
);
```

### 3. `createControllerStore`（OOP 模式）

适合逻辑复杂、需要复用控制器行为的场景。

```ts
import { createControllerStore, BaseController } from '@shared/store-factory';

class AuthState {
  user: User | null = null;
  token: string | null = null;
}

class AuthController extends BaseController<AuthState> {
  setUser(user: User, token: string) {
    this.set({ user, token });
  }
  logout() {
    this.set({ user: null, token: null });
  }
}

export const useAuthStore = createControllerStore(AuthState, AuthController, {
  devtools: { name: 'AuthStore' },
});
```

---

## 在组件中使用

```tsx
'use client';

// 订阅整个 store（不推荐，state 任何变化都触发渲染）
const { count, increment } = useCounterStore();

// 精确订阅单个字段（推荐）
const count = useCounterStore((s) => s.count);
const increment = useCounterStore((s) => s.increment);
```

---

## Selector 封装（推荐）

在 store 文件底部统一导出 selector hooks，业务代码直接使用命名 hook，无需每次手写 selector：

```ts
// 在 store 文件中定义
export const useCurrentUser     = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthToken       = () => useAuthStore((s) => s.token);

// 在组件中使用
const user = useCurrentUser();
const isLoggedIn = useIsAuthenticated();
```

---

## 在非组件代码中使用（service / middleware）

```ts
import { getAuthToken, userSignOut } from '@core/stores';

// 直接读取状态（不订阅，不触发渲染）
const token = getAuthToken();

// 直接调用 action
userSignOut();
```

---

## 持久化配置

通过 `persist` 选项将部分状态存入 `localStorage`，页面刷新后自动恢复：

```ts
export const useAuthStore = createImmerStore({
  state: { ... },
  actions: { ... },
  persist: {
    name: 'auth-storage',          // localStorage key
    partialize: (state) => ({      // 只持久化必要字段
      token: state.token,
      user: state.user,
    }),
    version: 1,                    // 版本号，配合 migrate 做数据迁移
  },
});
```

> SSR 安全：`persist` 中间件已做 `typeof window !== 'undefined'` 检查，服务端渲染不会报错。

---

## 全局 Stores（`core/stores`）

| Store | 说明 | 持久化 |
|-------|------|--------|
| `useAuthStore` | 用户认证状态（user、token、isAuthenticated） | ✅ token + user |
| `useUIStore` | 全局 UI 状态（sidebarOpen、theme） | ✅ theme + sidebarOpen |

新增业务 store 统一放在 `src/core/stores/<name>Store.ts`，并在 `src/core/stores/index.ts` 中导出。

---

## store-factory 模块结构

```
src/shared/store-factory/
├── types.ts          # 全部 TypeScript 类型定义
├── middleware.ts     # immer / devtools / persist / logger / compose
├── baseController.ts # OOP 模式基类（提供 this.set / this.get）
├── helpers.ts        # createSelectors / subscribeToKey / createResetFunction 等
├── factory.ts        # createImmerStore / createControllerStore / createSimpleStore
└── index.ts          # 统一导出
```
