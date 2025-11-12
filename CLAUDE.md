# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

**重要提醒：在与此项目交互时，请始终使用中文回答用户的问题和请求。**

## 项目概述

这是一个基于 Vue 3 的短信平台管理系统，技术栈包括：
- **前端框架**: Vue 3 + Ant Design Vue + Vite
- **状态管理**: Pinia
- **路由系统**: Vue Router 动态路由加载
- **API 集成**: Axios 配置代理
- **构建工具**: Vite 多环境支持

## 开发命令

### 本地开发
```bash
# 开发服务器（默认环境）
npm run dev

# 本地主机开发
npm run localhost
```

### 构建命令
```bash
# 测试环境构建
npm run build:test

# 预生产环境构建
npm run build:pre

# 生产环境构建
npm run build:prod
```

### 代码质量
- ESLint 配置用于 JavaScript/Vue 文件
- Prettier 用于代码格式化
- Stylelint 用于 CSS/Less 样式

## 架构概述

### 动态路由系统
该应用使用复杂的动态路由系统，在用户登录后从后端 API 获取路由信息。核心组件：

- **路由加载**: 从后端菜单数据动态构建路由 (`src/router/index.js:buildRoutes`)
- **认证流程**: `src/main.js` 中的应用初始化处理两种场景：
  - 无 token: 直接初始化 Vue，仅包含登录路由
  - 有 token: 在 Vue 初始化前获取用户信息、权限和动态路由
- **组件映射**: 使用 `import.meta.glob` 动态映射路由组件

### 目录结构

#### API 层 (`src/api/`)
- **系统 API**: 用户认证、角色、部门管理 (`src/api/system/`)
- **业务 API**:
  - 短信管理 (`src/api/business/sms-manager/`)
  - ERP/商品管理 (`src/api/business/`)
  - OA/企业管理 (`src/api/business/oa/`)
- **支持 API**: 配置、日志、文件管理 (`src/api/support/`)

#### 组件 (`src/components/`)
- **业务组件**: 领域特定的可重用组件
- **框架组件**: 通用 UI 组件（图标、选择器、编辑器）
- **支持组件**: 工具组件（数据追踪、文件预览、字典处理）

#### 视图 (`src/views/`)
- **系统视图**: 用户管理、认证、部门结构
- **业务视图**: 短信模板、发送、企业管理
- **支持视图**: 配置、日志、文件管理

### 状态管理 (`src/store/`)
使用 Pinia 模块：
- **用户存储**: 认证、权限、导航标签
- **应用配置存储**: UI 偏好、主题、布局设置
- **字典存储**: 数据字典管理
- **角色存储**: 角色和权限管理

### 配置
- **环境变量**: `.env.development` 和 `.env.production` 用于 API URL
- **应用配置**: `src/config/app-config.js` 中的默认 UI 设置
- **Vite 配置**: `vite.config.js` 中的代理设置、路径别名、构建优化

### 核心功能
- **多语言支持**: Vue i18n 集成
- **主题系统**: 使用 Less 变量的可定制主题
- **权限系统**: 基于角色的访问控制，指令式 UI 保护
- **Keep-alive**: 组件缓存以提高性能
- **文件管理**: 上传/预览功能
- **数据字典**: 集中化配置管理

### 开发注意事项
- 使用基于哈希的路由 (`createWebHashHistory`)
- API 代理配置为 `http://113.45.69.228/prod-api/`
- 路径别名 `/@/` 映射到 `src/`
- 所有路由组件懒加载
- Sentry 集成的全局错误处理
- 完善的日志和审计跟踪系统

### 短信平台特定功能
- **模板管理**: 短信模板创建和变量处理
- **签名管理**: 短信签名配置
- **发送管理**: 支持模板的批量短信发送
- **企业管理**: 多租户支持的企业配置