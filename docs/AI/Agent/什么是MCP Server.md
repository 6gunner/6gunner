---
sidebar_position: 1
---

## 定义

MCP（Model Context Protocol）是 Anthropic 提出的一种标准协议，用于标准化 AI 应用与外部之间的通信方式。

**核心价值**：有了这个协议，就可以让所有的AI模型统一地访问各种外部能力（如数据库、API、文件系统等），而无需为每个集成单独开发适配器。

**类比理解**：

- MCP 之于 AI 应用 ≈ USB 之于硬件设备

## MCP 架构概览

---

## MCP 协议定义了哪些方法？

| 方法             | 描述                                   |
| ---------------- | -------------------------------------- |
| `initialize`     | 初始化连接，返回 Server 基本信息和能力 |
| `tools/list`     | 获取 Server 提供的工具列表             |
| `tools/call`     | 调用具体的工具                         |
| `resources/list` | 获取可用资源列表                       |
| `resources/read` | 读取具体资源内容                       |
| `prompts/list`   | 获取预定义的 Prompt 模板列表           |
| `prompts/get`    | 获取具体的 Prompt 模板                 |

---

## 各方法详解

initialize: 返回mcp-server的基本信息

```json
{
  "capabilities": {
    "tools": {}
  },
  "serverInfo": {
    "name": "my-custom-server",
    "version": "1.0.0"
  }
}
```

### tools/list

获取 MCP Server 提供的工具列表：

```json
{
  "tools": [
    {
      "name": "calculate",
      "description": "执行数学计算",
      "inputSchema": {
        "type": "object",
        "properties": {
          "expression": {
            "type": "string",
            "description": "数学表达式"
          }
        },
        "required": ["expression"]
      }
    }
  ]
}
```

### tools/call

调用具体的工具（JSON-RPC 格式）：

```json
{
  "method": "tools/call",
  "params": {
    "name": "calculate",
    "arguments": { "expression": "1+1" }
  },
  "jsonrpc": "2.0",
  "id": 4
}
```

### resources/list & resources/read

资源（Resources）是 MCP Server 向 AI 暴露的数据源，如文件、数据库记录等：

```json
{
  "resources": [
    {
      "uri": "file:///path/to/document.txt",
      "name": "My Document",
      "mimeType": "text/plain"
    }
  ]
}
```

### prompts/list & prompts/get

预定义的 Prompt 模板，帮助 AI 更好地完成特定任务：

```json
{
  "prompts": [
    {
      "name": "summarize",
      "description": "Summarize the given content",
      "arguments": [{ "name": "content", "required": true }]
    }
  ]
}
```

---

## 如何开发 MCP Server？

使用官方 SDK `@modelcontextprotocol/sdk`：

```ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// 1. 创建 Server
const server = new Server(
  {
    name: 'mcp-server/amap-maps',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. 注册 tools/list handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: MAPS_TOOLS,
}));

// 3. 注册 tools/call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case 'search':
        return await handleSearch(request.params.arguments);
      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    return { error: error.message };
  }
});
```

---

## MCP 传输方式

MCP 支持两种传输方式：`Stdio`和`Http Streamable`

| 特性           | Stdio                                               | HTTP Streamable        |
| -------------- | --------------------------------------------------- | ---------------------- |
| **连接方式**   | Client 与 Server 在同一机器, 通过标准输入输出流通信 | HTTP + SSE             |
| **适用场景**   | 本地进程通信                                        | 跨网络远程通信         |
| **会话管理**   | 隐式（进程生命周期）                                | 显式（session ID）     |
| **流式支持**   | 原生支持                                            | 通过 SSE 实现          |
| **部署复杂度** | 简单                                                | 需要 Web 服务器        |
| **安全性**     | 进程隔离                                            | 需要额外的认证授权机制 |

### Stdio 模式

适用于本地 Client 连接本地 Server：

```ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

### HTTP Streamable 模式

[[什么是http-streamable]]

#### 完整代码示例：

```ts
import express from 'express';
import { randomUUID } from 'node:crypto';
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// 1. 创建 MCP Server
const server = new McpServer({
  name: 'example-server',
  version: '1.0.0',
});

// 2. 注册 Resource
server.registerResource(
  'echo',
  new ResourceTemplate('echo://{message}', { list: undefined }),
  { title: 'Echo Resource', description: 'Echoes back messages' },
  async (uri, { message }) => ({
    contents: [{ uri: uri.href, text: `Resource echo: ${message}` }],
  })
);

// 3. 注册 Tool
server.registerTool(
  'echo',
  {
    title: 'Echo Tool',
    description: 'Echoes back the provided message',
    inputSchema: { message: z.string() },
  },
  async ({ message }) => ({
    content: [{ type: 'text', text: `Tool echo: ${message}` }],
  })
);

// 4. 注册 Prompt
server.registerPrompt(
  'echo',
  {
    title: 'Echo Prompt',
    description: 'Creates a prompt to process a message',
    argsSchema: { message: z.string() },
  },
  ({ message }) => ({
    messages: [
      { role: 'user', content: { type: 'text', text: `Process: ${message}` } },
    ],
  })
);

// 5. 设置 Express 服务器
const app = express();
app.use(express.json());

// Session 管理
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// POST: 处理客户端请求
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // 初始化新连接
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        transports[id] = transport;
      },
    });
    transport.onclose = () => {
      if (transport.sessionId) delete transports[transport.sessionId];
    };
    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Invalid session' },
      id: null,
    });
    return;
  }
  await transport.handleRequest(req, res, req.body);
});

// GET: SSE 通知
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  if (!transports[sessionId]) return res.status(400).send('Invalid session');
  await transports[sessionId].handleRequest(req, res);
});

// DELETE: 终止会话
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  if (!transports[sessionId]) return res.status(400).send('Invalid session');
  await transports[sessionId].handleRequest(req, res);
});

app.listen(3000);
```

---

## 如何测试 MCP Server？

使用官方提供的 Inspector 工具：

```shell
npm install -g @modelcontextprotocol/inspector
npx mcp-inspector
```

- Inspector UI：http://localhost:6274/
- MCP Proxy Server：http://localhost:6277/

---

## 相关资源

- [MCP 官方文档](https://modelcontextprotocol.io/)
- [MCP SDK (TypeScript)](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
