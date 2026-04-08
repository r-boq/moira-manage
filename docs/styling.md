# Styling — 样式方案

基于 **SCSS Modules** + 全局设计令牌（变量/混入），配合 Ant Design 主题系统。

---

## 核心约定

| 规则 | 说明 |
|------|------|
| 组件样式使用 CSS Modules | 文件名 `index.module.scss`，自动生成哈希类名，无需担心冲突 |
| 全局样式只写全局行为 | `globals.scss` 仅放 reset、CSS 自定义属性、滚动条等真正全局的内容 |
| 变量和混入无需手动导入 | `next.config.ts` 的 `additionalData` 已自动注入，直接使用即可 |
| 禁止内联样式 | 除非动态计算，否则一律写进 `.module.scss` |

---

## 在组件中使用 CSS Modules

```tsx
// components/layout/Header/index.tsx
import styles from './index.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>...</div>
    </header>
  );
}
```

```scss
// components/layout/Header/index.module.scss
// ✅ 变量和混入直接使用，无需 @use
.header {
  height: $header-height;
  background-color: $color-bg-container;
  border-bottom: 1px solid $color-border-light;
}

.inner {
  @include flex-between;
  max-width: $layout-max-width;
  padding: 0 $spacing-lg;
}
```

---

## 设计令牌（变量）

变量定义在 `src/shared/styles/_variables.scss`，全部以 `$` 前缀使用。

### 颜色

```scss
$color-primary         // #1677ff — 主色
$color-primary-hover   // #4096ff
$color-primary-active  // #0958d9

$color-success         // #52c41a
$color-warning         // #faad14
$color-error           // #ff4d4f

$color-text-primary    // rgba(0,0,0,0.85)
$color-text-secondary  // rgba(0,0,0,0.45)
$color-text-disabled   // rgba(0,0,0,0.25)

$color-border          // #d9d9d9
$color-border-light    // #f0f0f0
$color-bg-layout       // #f5f5f5
$color-bg-container    // #ffffff
```

### 间距

```scss
$spacing-xs    // 4px
$spacing-sm    // 8px
$spacing-md    // 12px
$spacing-base  // 16px
$spacing-lg    // 24px
$spacing-xl    // 32px
$spacing-xxl   // 48px
```

### 字体

```scss
$font-size-xs    // 12px
$font-size-sm    // 13px
$font-size-base  // 14px  ← 默认正文
$font-size-md    // 16px
$font-size-lg    // 20px
$font-size-xl    // 24px

$font-weight-normal    // 400
$font-weight-medium    // 500
$font-weight-semibold  // 600
$font-weight-bold      // 700
```

### 圆角 / 阴影 / 动画

```scss
$radius-sm / $radius-base / $radius-md / $radius-lg / $radius-full
$shadow-sm / $shadow-base / $shadow-md / $shadow-lg
$transition-fast / $transition-base / $transition-slow
```

### 布局

```scss
$layout-max-width   // 1440px
$header-height      // 64px
$sidebar-width      // 240px
$sidebar-width-mini // 80px
$content-padding    // 24px
```

### 断点

```scss
$breakpoint-xs   // 480px
$breakpoint-sm   // 576px
$breakpoint-md   // 768px
$breakpoint-lg   // 992px
$breakpoint-xl   // 1200px
$breakpoint-xxl  // 1600px
```

---

## 混入（Mixins）

混入定义在 `src/shared/styles/_mixins.scss`，用 `@include` 调用。

### 响应式断点

```scss
.container {
  padding: $spacing-lg;

  @include md {            // max-width: 768px
    padding: $spacing-base;
  }

  @include sm {            // max-width: 576px
    padding: $spacing-sm;
  }
}
```

可用断点：`@include xs/sm/md/lg/xl/xxl`

### Flex 布局

```scss
@include flex-center      // align + justify center
@include flex-x-center    // justify center
@include flex-y-center    // align center
@include flex-between     // space-between + align center
```

### 文本溢出

```scss
.title {
  @include text-ellipsis;   // 单行省略
}

.description {
  @include text-clamp(3);   // 多行省略，显示 3 行
}
```

### 滚动条

```scss
.list {
  @include scrollbar-hidden;         // 隐藏但保留滚动
  @include scrollbar-thin;           // 细滚动条（默认颜色）
  @include scrollbar-thin(#ccc);     // 自定义 thumb 颜色
}
```

### 其他

```scss
@include absolute-fill    // position: absolute; inset: 0
@include hit-area(8px)    // 扩大点击区域（伪元素 inset: -8px）
```

---

## 与 Ant Design 共存

- antd 5.x 使用 CSS-in-JS，**不会**与 SCSS Modules 产生冲突
- 全局颜色变量与 antd 的 Design Token 保持一致（如 `$color-primary` = antd 默认主色）
- 如需自定义 antd 主题，在 `app/layout.tsx` 中使用 `ConfigProvider` 的 `theme.token`

```tsx
// 自定义 antd 主题示例
<ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
  {children}
</ConfigProvider>
```

---

## 文件组织规范

```
# 全局
src/app/globals.scss                  ← 全局 reset / CSS 变量 / 滚动条

# 设计令牌（自动注入，无需 @use）
src/shared/styles/_variables.scss
src/shared/styles/_mixins.scss

# 组件私有样式（CSS Module，与组件同目录）
src/components/layout/Header/index.module.scss
src/features/auth/components/LoginForm/index.module.scss
```
