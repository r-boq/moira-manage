# Features — 业务模块开发规范

## 设计原则

每个 feature 目录代表一个**独立的业务模块**，对外只暴露一个页面组件，内部实现完全封闭。

- **高内聚**：与该业务相关的组件、hooks、样式、服务调用都放在模块内部
- **低耦合**：禁止跨 feature 直接引用，需要共享的逻辑提升到 `core` 或 `shared`
- **单一出口**：每个 feature 通过 `index.tsx` 导出唯一的默认页面组件

---

## 标准目录结构

```
src/features/<module-name>/
├── index.tsx                   # 唯一对外出口（export default PageComponent）
├── types.ts                    # 模块内部 TypeScript 类型
├── components/                 # 模块内部组件
│   ├── <PageName>Page.tsx      # 页面组件（组装所有子组件）
│   ├── <SubComponent>/
│   │   ├── index.tsx
│   │   └── index.module.scss
│   └── ...
├── hooks/                      # 模块内部 hooks
│   └── use<Something>.ts
└── services/                   # 模块 API 调用（可选，也可直接用 core/services）
    └── index.ts
```

---

## 新增业务模块步骤

### 1. 创建 feature 目录

```bash
mkdir -p src/features/order/{components,hooks,services}
```

### 2. 定义模块类型（`types.ts`）

```ts
// src/features/order/types.ts
export interface Order {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}
```

### 3. 封装 API 调用（`services/index.ts`）

```ts
// src/features/order/services/index.ts
import { http } from '@shared/lib';
import type { ApiResponse } from '@shared/types';
import type { Order } from '../types';

export const orderService = {
  getList(): Promise<ApiResponse<Order[]>> {
    return http.get<Order[]>('/orders');
  },
};
```

### 4. 编写业务 Hook（`hooks/`）

```ts
// src/features/order/hooks/useOrderList.ts
'use client';

import { useState, useEffect } from 'react';
import { orderService } from '../services';
import type { Order } from '../types';

export function useOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getList().then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  return { orders, loading };
}
```

### 5. 实现页面组件（`components/<Name>Page.tsx`）

```tsx
// src/features/order/components/OrderPage.tsx
import { Table } from 'antd';
import { useOrderList } from '../hooks/useOrderList';

export function OrderPage() {
  const { orders, loading } = useOrderList();
  return <Table dataSource={orders} loading={loading} rowKey="id" />;
}
```

### 6. 暴露出口（`index.tsx`）

```tsx
// src/features/order/index.tsx
export { OrderPage as default } from './components/OrderPage';
```

### 7. 接入 App Router

```tsx
// src/app/order/page.tsx
import OrderPage from '@features/order';

export default function Page() {
  return <OrderPage />;
}
```

---

## 内部组件规范

- 组件文件名用 PascalCase，目录名与主文件同名
- 每个组件目录配套一个 `index.module.scss`（如有样式需求）
- 组件不直接调用 `fetch` 或 `http`，通过 hooks 获取数据

```
components/
└── OrderTable/
    ├── index.tsx            # 组件实现
    └── index.module.scss    # 组件私有样式
```

---

## 已有模块

| 模块 | 路由 | 说明 |
|------|------|------|
| `auth` | `/login` | 登录页，含 LoginForm 组件 |
| `dashboard` | `/dashboard` | 数据概览，含统计卡片 |
