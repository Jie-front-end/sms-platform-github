# GPT-5 MCP Server

一个用于 Claude Desktop 的 MCP (Model Context Protocol) 服务器，提供与 GPT-5 进行问答交互的能力。

## 功能特性

- 🤖 **GPT-5 对话**：支持单次问答和多轮对话
- ⚙️ **灵活配置**：可自定义温度、最大令牌数等参数
- 📝 **系统提示**：支持自定义系统消息来控制 GPT-5 的行为
- 💬 **对话历史**：支持多轮对话，保持上下文连贯性

## 安装步骤

### 1. 安装依赖

```bash
cd gpt5-mcp-server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的 OpenAI API 密钥：

```env
OPENAI_API_KEY=your-actual-api-key-here
```

**获取 API 密钥：**
1. 访问 https://platform.openai.com/api-keys
2. 登录您的 OpenAI 账号
3. 创建新的 API 密钥
4. 复制密钥并粘贴到 `.env` 文件中

### 3. 在 Claude Desktop 中配置

编辑 Claude Desktop 配置文件：

**MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

添加以下配置：

```json
{
  "mcpServers": {
    "gpt5": {
      "command": "node",
      "args": [
        "D:\\a-code\\vue\\sms-platform-github\\gpt5-mcp-server\\index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**注意：** 请将路径替换为您实际的项目路径。

### 4. 重启 Claude Desktop

配置完成后，重启 Claude Desktop 应用以加载 MCP 服务器。

## 可用工具

### 1. gpt5_chat

基本的单次问答工具，适合独立的问题。

**参数：**
- `prompt` (必需): 要发送给 GPT-5 的问题或提示
- `system_message` (可选): 系统消息，用于设定 GPT-5 的角色和行为
- `temperature` (可选): 控制回答的随机性，范围 0-2，默认 0.7
- `max_tokens` (可选): 最大生成令牌数，默认 2000

**示例：**
```
请使用 gpt5_chat 工具回答：什么是量子计算？
```

### 2. gpt5_chat_with_history

支持多轮对话的工具，可以保持上下文。

**参数：**
- `messages` (必需): 对话历史消息数组，每条消息包含 `role` 和 `content`
  - `role`: "system"（系统）、"user"（用户）或 "assistant"（助手）
  - `content`: 消息内容
- `temperature` (可选): 控制回答的随机性，范围 0-2，默认 0.7
- `max_tokens` (可选): 最大生成令牌数，默认 2000

**示例：**
```
使用 gpt5_chat_with_history 工具进行多轮对话：
[
  {"role": "system", "content": "你是一位专业的 Python 编程导师"},
  {"role": "user", "content": "如何使用 Python 读取文件？"},
  {"role": "assistant", "content": "可以使用 open() 函数..."},
  {"role": "user", "content": "那如何处理大文件呢？"}
]
```

## 使用场景

1. **编程辅助**：让 GPT-5 帮助解决编程问题
2. **内容创作**：生成文章、代码、文档等
3. **数据分析**：分析和解释复杂数据
4. **翻译和改写**：多语言翻译和内容改写
5. **知识问答**：回答各类专业问题

## 使用示例

在 Claude Desktop 中，您可以这样使用：

```
帮我问问 GPT-5：如何优化 Vue 3 的性能？
```

或者对于需要特定角色的场景：

```
使用 gpt5_chat，系统消息设为"你是一位资深的前端架构师"，问题是"如何设计一个可扩展的组件库？"
```

## 注意事项

1. **API 费用**：使用 GPT-5 API 会产生费用，请注意您的 OpenAI 账户余额
2. **模型名称**：代码中使用的模型名称为 `gpt-5-preview`，如果 OpenAI 使用不同的模型名称，请修改 `index.js` 中的 `model` 参数
3. **速率限制**：OpenAI API 有速率限制，频繁调用可能会被限制
4. **安全性**：请妥善保管您的 API 密钥，不要将其提交到公共代码仓库

## 开发和调试

### 运行服务器（独立测试）

```bash
npm start
```

### 查看日志

服务器日志会输出到 stderr，在 Claude Desktop 的开发者工具中可以查看。

## 故障排查

### 问题 1：无法连接到 MCP 服务器

**解决方案：**
- 检查配置文件路径是否正确
- 确认 Node.js 已正确安装（`node --version`）
- 查看 Claude Desktop 的开发者工具中的错误日志

### 问题 2：API 密钥错误

**解决方案：**
- 确认 `.env` 文件中的 API 密钥正确
- 确认 API 密钥有足够的额度
- 检查 Claude Desktop 配置中的环境变量是否正确设置

### 问题 3：模型不存在错误

**解决方案：**
- GPT-5 可能还未正式发布，请修改 `index.js` 中的模型名称为可用的模型（如 `gpt-4-turbo` 或 `gpt-4`）

## 技术栈

- **MCP SDK**: @modelcontextprotocol/sdk
- **OpenAI SDK**: openai
- **Node.js**: 18+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关资源

- [MCP 协议文档](https://modelcontextprotocol.io/)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Claude Desktop](https://claude.ai/desktop)
