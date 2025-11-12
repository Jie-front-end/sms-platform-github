# 请使用中文来回答
# 仓库指南

## 项目结构与模块组织
- `src/` 存放应用代码：`api/` 用于后端网关，`views/` 存放路由页面，`components/` 存放共享组件，此外还有 `router/`、`store/` 与 `plugins/` 负责核心装配。
- `public/` 提供原始资源；`src/assets/` 会由 Vite 处理。生成后的构建文件位于 `dist`，请勿提交到仓库。
- 环境覆盖配置位于 `.env.*`；新增环境时请复制 `.env.localhost`，并在 `src/config` 中引用对应的键。
- 全局样式、主题与指令位于 `src/theme/` 与 `src/directives/`；在编写新变体前优先复用既有方案。

## 构建、测试与开发命令
- `npm install` 安装依赖（需要 Node.js >=18，可在 `package.json` 中查看声明）。
- `npm run dev` 启动 Vite 开发服务器，对接默认 API 目标并支持热更新。
- `npm run localhost` 使用 `.env.localhost` 启动应用，便于本地模拟服务。
- `npm run build:test|build:pre|build:prod` 针对不同环境生成优化后的构建；`build:test` 还会为预发部署配置 `/admin/` 基路径。

## 编码风格与命名约定
- Prettier 强制使用 2 空格缩进、单引号和 150 字符的打印宽度；ESLint 与 Stylelint 负责约束 Vue 3、ES2021 以及 Less 的规范。
- Vue 单文件组件使用 PascalCase 命名，工具方法使用 camelCase，常量使用 `src/constants/` 下的 SCREAMING_SNAKE_CASE。
- 保持模板精简：将共享逻辑抽离到 `src/components/`，或在 `src/lib/` 与 `src/utils/` 中编写组合式工具。
- 在提交 PR 前运行 `npx eslint "src/**/*.{js,vue}"` 与 `npx prettier --check .`，避免 CI 阻塞。

## 测试指引
- 目前没有自动化测试脚本；每次修改后，请通过浏览器（`npm run dev`）亲自验证涉及的流程，并记录控制台或网络异常。
- 校验通过 `src/router/` 与 `src/api/` 实现的基于角色的导航与 API 权限；若出现失败，请保存截图或 HAR 文件。
- 引入自动化覆盖时，请与 Vite 技术栈对齐（例如 Vitest 搭配 Vue Test Utils），并在 `package.json` 中提交相关脚本供团队复用。

## 提交与 Pull Request 指南
- 遵循约定式提交（Conventional Commit），例如 `feat:`、`fix:`、`refactor:`，并保持简洁、注重行动的摘要（如 `feat: add channel quota dashboard`）。
- 在提交前 rebase 或 squash 掉噪音较大的 WIP 历史，确保每个提交都能通过构建与 lint。
- PR 中应描述变更内容，列出验证命令（如 `npm run dev` 以及相关 `npm run build:*`），关联问题或任务，并在 UI 更新时附上前后对比截图。
