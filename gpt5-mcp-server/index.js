#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'gpt5-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定义可用的工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'gpt5_chat',
        description: '使用 GPT-5 进行对话问答。可以处理各种问题，包括编程、写作、分析等任务。',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: '要发送给 GPT-5 的问题或提示',
            },
            system_message: {
              type: 'string',
              description: '可选的系统消息，用于设定 GPT-5 的角色和行为',
              default: 'You are a helpful assistant.',
            },
            temperature: {
              type: 'number',
              description: '控制回答的随机性，范围 0-2，默认 0.7',
              default: 0.7,
              minimum: 0,
              maximum: 2,
            },
            max_tokens: {
              type: 'number',
              description: '最大生成令牌数，默认 2000',
              default: 2000,
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'gpt5_chat_with_history',
        description: '使用 GPT-5 进行多轮对话，支持对话历史。适合需要上下文的连续对话。',
        inputSchema: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              description: '对话历史消息数组，每条消息包含 role 和 content',
              items: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['system', 'user', 'assistant'],
                    description: '消息角色：system（系统）、user（用户）或 assistant（助手）',
                  },
                  content: {
                    type: 'string',
                    description: '消息内容',
                  },
                },
                required: ['role', 'content'],
              },
            },
            temperature: {
              type: 'number',
              description: '控制回答的随机性，范围 0-2，默认 0.7',
              default: 0.7,
              minimum: 0,
              maximum: 2,
            },
            max_tokens: {
              type: 'number',
              description: '最大生成令牌数，默认 2000',
              default: 2000,
            },
          },
          required: ['messages'],
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'gpt5_chat') {
      const { prompt, system_message, temperature, max_tokens } = args;

      // 调用 GPT-5 API
      const completion = await openai.chat.completions.create({
        model: 'gpt-5-preview', // 注意：实际模型名称可能需要调整
        messages: [
          {
            role: 'system',
            content: system_message || 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2000,
      });

      const response = completion.choices[0].message.content;

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } else if (name === 'gpt5_chat_with_history') {
      const { messages, temperature, max_tokens } = args;

      // 调用 GPT-5 API（带历史记录）
      const completion = await openai.chat.completions.create({
        model: 'gpt-5-preview', // 注意：实际模型名称可能需要调整
        messages: messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2000,
      });

      const response = completion.choices[0].message.content;

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GPT-5 MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
