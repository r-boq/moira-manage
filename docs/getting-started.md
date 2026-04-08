# Getting Started

## 环境要求

| 工具 | 版本要求 |
|------|---------|
| Node.js | >= 20.x |
| pnpm | >= 9.x |
| Git | 任意现代版本 |

安装 pnpm（如尚未安装）：

```bash
npm install -g pnpm
```

---

## 安装依赖

```bash
pnpm install
```

`pnpm install` 完成后会自动执行 `prepare` 脚本，注册 Husky Git Hooks。

---

## 环境变量

复制示例文件并按需填写：

```bash
cp .env.example .env.local
```

`.env.local` 不会提交到 Git，`.env.example` 作为模板维护在仓库中。

| 变量 | 说明 | 示例 |
|------|------|------|
| `NEXT_PUBLIC_APP_URL` | 应用访问地址 | `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 基础地址 | `http://localhost:8080/api` |

---

## 启动开发服务

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。

---

## 常用命令

```bash
# 开发
pnpm dev              # 启动 Next.js 开发服务器（Turbopack）

# 构建 & 生产
pnpm build            # 生产构建
pnpm start            # 启动生产服务器（需先 build）

# 代码质量
pnpm lint             # ESLint 检查（0 warnings 即通过）
pnpm lint:fix         # ESLint 自动修复
pnpm format           # Prettier 格式化所有文件
pnpm format:check     # Prettier 仅检查，不修改（CI 用）
pnpm type-check       # TypeScript 类型检查（不输出文件）
```

---

## 提交代码

每次 `git commit` 会自动触发 pre-commit hook：

1. 对 staged 的 `*.{ts,tsx}` 文件运行 `eslint --fix` + `prettier --write`
2. 对 staged 的 `*.{scss,css,json,md}` 运行 `prettier --write`

若检查不通过，提交会被阻断。修复后重新 `git add` 再提交即可。

---

## 推荐编辑器配置（VS Code）

安装以下插件以获得最佳体验：

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **SCSS IntelliSense** (`mrmlnc.vscode-scss`)

在项目根目录创建 `.vscode/settings.json`：

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```
