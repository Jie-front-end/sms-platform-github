# Vercel 一键部署指南

## 方式一：通过 Vercel 网站部署（推荐）

### 步骤 1：推送代码到 GitHub

首先确保您的代码已经推送到 GitHub 仓库。如果还没有推送，执行：

```bash
git add .
git commit -m "feat: 配置 Vercel 部署"
git push origin feature/sms-platform-features
```

或者推送到 main 分支：
```bash
git checkout main
git merge feature/sms-platform-features
git push origin main
```

### 步骤 2：登录 Vercel

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 "Sign Up" 或 "Login"
3. 使用 GitHub 账号登录（推荐）

### 步骤 3：导入项目

1. 登录后，点击 "Add New..." → "Project"
2. 在 "Import Git Repository" 页面，找到您的 `sms-platform-github` 仓库
3. 点击 "Import"

### 步骤 4：配置项目

Vercel 会自动检测到这是一个 Vite 项目，并填充以下配置：

- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run vercel-build` 或 `vite build`
- **Output Directory**: `dist`

如果自动检测不正确，请手动配置：

```
Framework Preset: Vite
Build Command: npm run vercel-build
Output Directory: dist
Install Command: npm install
```

### 步骤 5：配置环境变量（重要）

在 "Environment Variables" 部分添加：

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `VITE_APP_TITLE` | `短信平台管理系统` |
| `VITE_APP_API_URL` | `http://113.45.69.228/prod-api/` |

**注意**：如果您的后端 API 地址不同，请修改 `VITE_APP_API_URL` 的值。

### 步骤 6：部署

1. 点击 "Deploy" 按钮
2. 等待构建和部署完成（通常需要 2-5 分钟）
3. 部署成功后，Vercel 会提供一个访问链接，如：`https://your-project.vercel.app`

---

## 方式二：使用 Vercel CLI 部署

### 步骤 1：安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2：登录 Vercel

```bash
vercel login
```

选择使用 GitHub、GitLab 或 Email 登录。

### 步骤 3：部署项目

在项目根目录执行：

```bash
# 第一次部署
vercel

# 生产环境部署
vercel --prod
```

按照提示操作：
1. Set up and deploy: **Y**
2. Which scope: 选择您的账户
3. Link to existing project: **N**（首次部署选否）
4. Project name: 保持默认或自定义
5. In which directory: `./`（当前目录）
6. Override settings: **N**（使用 vercel.json 配置）

### 步骤 4：设置环境变量

```bash
# 添加环境变量
vercel env add VITE_APP_API_URL production

# 输入值
http://113.45.69.228/prod-api/

# 添加其他环境变量
vercel env add VITE_APP_TITLE production
短信平台管理系统
```

### 步骤 5：重新部署

```bash
vercel --prod
```

---

## 方式三：一键部署按钮

在 GitHub 仓库的 README.md 中添加一键部署按钮：

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jie-front-end/sms-platform-github&env=VITE_APP_API_URL,VITE_APP_TITLE&envDescription=API%20URL%20and%20App%20Title&envLink=https://github.com/Jie-front-end/sms-platform-github)
```

点击按钮后，Vercel 会自动克隆仓库并引导您完成部署。

---

## 部署后配置

### 1. 自定义域名

1. 在 Vercel 项目设置中，进入 "Domains" 标签
2. 添加您的自定义域名（如：`sms.yourdomain.com`）
3. 按照提示在域名服务商处添加 DNS 记录：
   - **Type**: CNAME
   - **Name**: sms（或其他子域名）
   - **Value**: cname.vercel-dns.com
4. 等待 DNS 生效（通常需要几分钟到几小时）

Vercel 会自动为您的自定义域名配置 HTTPS 证书。

### 2. 配置 API 代理（解决跨域问题）

如果遇到 CORS 跨域问题，有两种解决方案：

#### 方案 A：后端配置 CORS（推荐）

在后端 API 服务器配置 CORS 头：
```
Access-Control-Allow-Origin: https://your-project.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### 方案 B：使用 Vercel Rewrites

修改 `vercel.json`：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://113.45.69.228/prod-api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

然后修改前端 API 调用，将：
- `http://113.45.69.228/prod-api/xxx`
- 改为：`/api/xxx`

### 3. 自动部署

Vercel 默认会自动部署：
- **main/master 分支**：自动部署到生产环境
- **其他分支**：自动部署到预览环境

每次 push 代码后，Vercel 会自动触发构建和部署。

### 4. 查看部署状态

1. 访问 Vercel Dashboard：[https://vercel.com/dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 查看 "Deployments" 标签，可以看到所有部署历史
4. 点击具体的部署可以查看构建日志

---

## 常见问题

### Q1: 构建失败，提示依赖安装错误

**解决方案**：
1. 检查 `package.json` 中的依赖版本
2. 在本地运行 `npm install` 确认没有问题
3. 清除 Vercel 缓存：在项目设置中找到 "Clear Cache" 并重新部署

### Q2: 页面刷新后显示 404

**解决方案**：
确保 `vercel.json` 配置正确，包含路由重写规则（已配置）。

### Q3: 环境变量不生效

**解决方案**：
1. 确认环境变量名称以 `VITE_` 开头
2. 在 Vercel Dashboard 中检查环境变量是否正确设置
3. 重新部署项目

### Q4: API 请求失败（CORS 错误）

**解决方案**：
参考上面的 "配置 API 代理" 部分。

### Q5: 部署成功但页面空白

**解决方案**：
1. 打开浏览器开发者工具，查看控制台错误
2. 检查 API 地址是否正确
3. 确认后端服务是否可访问

---

## 性能优化建议

### 1. 启用边缘缓存

Vercel 自动为静态资源启用 CDN 缓存。

### 2. 图片优化

使用 Vercel Image Optimization：
```jsx
import Image from 'next/image'
// 如果使用 Next.js
```

### 3. 分析构建产物

```bash
# 安装分析工具
npm install --save-dev rollup-plugin-visualizer

# 分析打包体积
npm run build:prod
```

---

## 监控与分析

### 1. Vercel Analytics

在项目设置中启用 Vercel Analytics，可以查看：
- 页面访问量
- 性能指标
- 用户地理分布

### 2. 实时日志

在 Vercel Dashboard 中查看实时日志：
- 访问日志
- 错误日志
- 构建日志

---

## 回滚部署

如果新部署出现问题，可以快速回滚：

1. 进入 Vercel Dashboard → Deployments
2. 找到之前的稳定版本
3. 点击 "Promote to Production"

---

## 成本说明

Vercel 提供免费套餐，适合个人和小型项目：

**免费套餐包含**：
- 100GB 带宽/月
- 无限制的部署次数
- 自动 HTTPS
- 全球 CDN
- 预览部署

**升级到 Pro（$20/月）可获得**：
- 1TB 带宽/月
- 更多并发构建
- 团队协作功能
- 优先支持

---

## 总结

使用 Vercel 部署的优势：
- ✅ 自动化部署，推送代码即部署
- ✅ 全球 CDN 加速
- ✅ 自动配置 HTTPS
- ✅ 预览部署，每个分支都有独立预览地址
- ✅ 零配置，开箱即用
- ✅ 免费额度充足

**推荐工作流程**：
1. 本地开发 → push 到 GitHub
2. Vercel 自动构建和部署
3. 在预览环境测试
4. 合并到 main 分支，自动部署到生产环境

---

## 下一步

部署完成后，您可以：
1. 配置自定义域名
2. 设置团队协作
3. 启用 Analytics 监控
4. 配置 Webhook 通知

有问题请参考 [Vercel 官方文档](https://vercel.com/docs) 或提交 Issue。
