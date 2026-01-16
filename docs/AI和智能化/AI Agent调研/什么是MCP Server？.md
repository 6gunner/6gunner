### MCP Server

按照model context protocol实现的server

### 定义了哪些东西？

- initialize
- tools/list
- tools/call
- resources/list
- resources/read
- prompts/list

### 分别代表什么意思？

initialize:  返回mcp-server的基本信息
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


tools/list：mcp server提供了哪些工具？
```json
{
  "tools": [
    {
      "name": "calculate",
      "description": "执行数学计算",
      "inputSchema": { // 方法参数
        "type": "object",
        "properties": {
          "expression": {
            "type": "string",
            "description": "数学表达式"
          }
        },
        "required": [
          "expression" // 指定哪些字段必填
        ]
      }
    }
  ]
}
```


tools/call： 调用mcp-server方法

rpc调用
```json
{
  "method":"tools/call",
  "params":{
    "name":"calculate",
	"arguments":{"expression":"1/0"},
	"_meta":{"progressToken":4}
  },
  "jsonrpc":"2.0",
  "id":4
}
```



### 如何测试一个mcp-server？

nodejs环境下：
使用`@modelcontextprotocol/inspector`来测试
```shell
npm install -g @modelcontextprotocol/inspector
npx mcp-inspector
```
会在本地启动http://localhost:6274/服务，提供操作界面；
mcp proxy server会启动在localhost:6277端口上

### 如何写一个mcp-server?

nodejs：

市面上提供了`@modelcontextprotocol/sdk`

```ts
// 创建server
const server = new Server({
  name: "mcp-server/amap-maps",
  version: "0.1.0",
}, {
  capabilities: {
    tools: {},
  }
});

// 配置server的request handler, tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: MAPS_TOOLS,
}));

// 配置server的request handler, tools/call 
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // 写一些业务逻辑
  try {
	  switch (request.params.name) {
		  case 'a':
			  return xxx;
		  default:
			 return xxx; 
	  }
  catch (error) {
  }
});
```





### Stdio和SSE两种Transport的区别？

Stdio这种一般是本地启动用的，本地client连本地server，没有端口的概念；

```ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// 启动服务器 
async function main() { 
	const transport = new StdioServerTransport(); 
	await server.connect(transport); 
} 

```

SSE 或者现在有一个叫Http Streamable的模式，是给remote client用的；

### HttpStreamable怎么实现的？

![img](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2025/08-20/1*xomZqWgkyrASicb7RWhrjA.png)


几个阶段：

1、建立初始化链接阶段：
a、client发送init 请求
b、服务端响应init resp，携带mcp-session-id
c、客户端发送init建立成功的通知
d、服务端响应202（200不同于200，202代表服务端已接收到通知，但是处理没结束，所以一直保持着🔗）

2、客户端请求阶段：
a、携带mcp-session-id，发送请求
b、服务端响应resp（单个http resp的情况）
c、服务端开启sse stream，持续发送消息（多消息，用sse处理的情况）

3、客户端通知阶段：
a、客户端发送通知消息（比如取消xxx操作）
b、服务端响应202，不返回任何东西

4、服务端请求阶段：
a、在mcp-session-id对应的连接持续阶段，一直发送sse消息



nodejs代码：

```ts
import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0"
});

server.registerResource(
  "echo",
  new ResourceTemplate("echo://{message}", { list: undefined }),
  {
    title: "Echo Resource",
    description: "Echoes back messages as resources"
  },
  async (uri, { message }) => ({
    contents: [{
      uri: uri.href,
      text: `Resource echo: ${message}`
    }]
  })
);

server.registerTool(
  "echo",
  {
    title: "Echo Tool",
    description: "Echoes back the provided message",
    inputSchema: { message: z.string() }
  },
  async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }]
  })
);

server.registerPrompt(
  "echo",
  {
    title: "Echo Prompt",
    description: "Creates a prompt to process a message",
    argsSchema: { message: z.string() }
  },
  ({ message }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please process this message: ${message}`
      }
    }]
  })
);

const app = express();
app.use(express.json());

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req, res) => {
  // Check for existing session ID
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    // Reuse existing transport
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New initialization request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        // Store the transport by session ID
        transports[sessionId] = transport;
      },
      // DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
      // locally, make sure to set:
      // enableDnsRebindingProtection: true,
      // allowedHosts: ['127.0.0.1'],
    });

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };


    // Connect to the MCP server
    await server.connect(transport);
  } else {
    // Invalid request
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  // Handle the request
  await transport.handleRequest(req, res, req.body);
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', handleSessionRequest);

// Handle DELETE requests for session termination
app.delete('/mcp', handleSessionRequest);

app.listen(3000);
```






### 鉴权处理

提供mcp server，所有人都能看到，怎么实现鉴权？

