---
title: HTTP Streamable详解
sidebar_label: HTTP Streamable
description: 深入理解 MCP 协议中的 HTTP Streamable 传输方式，结合 HTTP 和 SSE 实现跨网络的高效 AI 代理通信
tags: [HTTP, Streamable, MCP, SSE, 流式传输, AI通信]
keywords:
  [HTTP Streamable, MCP协议, Server-Sent Events, 流式通信, AI代理, JSON-RPC]
sidebar_position: 1
slug: /ai/base/httpstreamable
---

# HTTP Streamable详解

## 概述

HTTP Streamable 是 MCP（Model Context Protocol）协议中用于远程通信的传输方式之一（另一种是 Stdio 本地传输）。它巧妙地结合了 HTTP 协议的通用性和 SSE（Server-Sent Events）的流式能力，实现了跨网络的高效 AI 代理通信。

![HTTP Streamable 流程图](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2025/08-20/1*xomZqWgkyrASicb7RWhrjA.png)

---

## 核心特点

HTTP Streamable 模式是 MCP 为远程通信设计的传输方式，它结合了 HTTP 协议和 SSE（Server-Sent Events）技术，使得 Client 和 Server 可以跨网络进行高效通信。与传统的请求-响应模式不同，这种模式支持：

| 特性           | 说明                                 | 技术实现                      |
| -------------- | ------------------------------------ | ----------------------------- |
| **会话管理**   | 维护客户端与服务器之间的持久会话状态 | 通过 `mcp-session-id` 请求头  |
| **流式响应**   | 服务器主动推送多条消息给客户端       | 基于 SSE（text/event-stream） |
| **异步通知**   | 客户端发送无需响应的通知消息         | HTTP 202 Accepted 状态码      |
| **双模式响应** | 支持单次响应和流式响应两种模式       | 根据场景动态选择              |

---

## 通信流程详解

---

## 通信流程详解

### 阶段 1：初始化（Initialization）

**时序图**：

```
Client                              Server
  │                                   │
  │──── POST /mcp (init request) ────►│
  │◄─── Response + mcp-session-id ────│
  │──── POST /mcp (init notify) ─────►│
  │◄─── 202 Accepted ─────────────────│
```

#### 第一步：初始化请求

| 项目       | 内容                                 |
| ---------- | ------------------------------------ |
| **方法**   | POST /mcp                            |
| **请求头** | 无 `mcp-session-id`（首次连接）      |
| **请求体** | JSON-RPC `initialize` 方法调用       |
| **响应头** | 返回 `mcp-session-id`                |
| **响应体** | 服务器信息和能力声明（capabilities） |

**请求示例**：

```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "my-client",
      "version": "1.0.0"
    }
  },
  "id": 1
}
```

**响应示例**：

```http
HTTP/1.1 200 OK
mcp-session-id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {}
    },
    "serverInfo": {
      "name": "example-server",
      "version": "1.0.0"
    }
  },
  "id": 1
}
```

**关键点**：

- Server 创建新会话，生成唯一的 `mcp-session-id`（通常是 UUID）
- Session ID 通过**响应头**返回给 Client
- Client 必须保存此 ID，用于后续所有请求

#### 第二步：初始化通知

| 项目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| **方法**   | POST /mcp                                        |
| **请求头** | **携带** `mcp-session-id`                        |
| **请求体** | `notifications/initialized` 消息（无 `id` 字段） |
| **响应**   | 202 Accepted（无业务数据）                       |

**请求示例**：

```http
POST /mcp HTTP/1.1
mcp-session-id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

**为什么需要这一步？**

- 告知 Server 客户端已成功接收 Session ID 并准备就绪
- 符合 JSON-RPC 协议规范（初始化完成后需要通知）
- Server 可以在此时进行一些会话级别的初始化工作

**完成初始化后**，会话正式建立，进入正常通信阶段。

---

### 阶段 2：请求与响应（Request/Response）

**时序图**：

```
Client                              Server
  │                                   │
  │──── POST /mcp + session-id ──────►│
  │◄─── Response (单次) ──────────────│
  │     或                            │
  │◄─── SSE Stream (多消息) ──────────│
```

#### 发送请求

#### 发送请求

Client 调用 Server 提供的各种 MCP 方法（`tools/list`、`tools/call`、`resources/read` 等）：

**请求格式**：

```http
POST /mcp HTTP/1.1
mcp-session-id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "calculate",
    "arguments": { "expression": "1+1" }
  },
  "id": 2
}
```

**必需条件**：

- ✅ 请求头必须携带 `mcp-session-id`
- ✅ 使用已建立的 Session ID
- ✅ 请求体为标准 JSON-RPC 格式

#### 服务器响应：双模式设计

Server 根据操作特点，可以选择两种响应模式：

**模式 1：普通 HTTP 响应（适合快速操作）**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      { "type": "text", "text": "2" }
    ]
  },
  "id": 2
}
```

**特点**：

- 一次性响应，响应完成后连接关闭
- 适用于：快速查询、简单计算、静态数据返回
- 低延迟，资源占用少

**模式 2：SSE 流式响应（适合长耗时操作）**

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"jsonrpc":"2.0","result":{"content":[{"type":"text","text":"Calculating..."}]},"id":2}

data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progress":50}}

data: {"jsonrpc":"2.0","result":{"content":[{"type":"text","text":"Result: 2"}]},"id":2}


```

**特点**：

- 连接保持打开，持续推送多条消息
- 每条消息以 `data:` 开头，以 `\n\n` 结尾（SSE 标准格式）
- 可以推送进度通知、中间结果、最终结果
- 适用于：AI 生成、大数据处理、长时间计算、实时进度更新

**两种模式的选择策略**：

| 场景           | 推荐模式 | 原因                 |
| -------------- | -------- | -------------------- |
| 获取工具列表   | 普通响应 | 数据量小，无需流式   |
| 读取短文本资源 | 普通响应 | 一次性返回即可       |
| AI 文本生成    | SSE 流式 | 逐字显示，提升体验   |
| 大文件处理     | SSE 流式 | 需要推送进度         |
| 复杂计算       | SSE 流式 | 多步骤，中间状态反馈 |

---

### 阶段 3：通知（Notifications）

**时序图**：

```
Client                              Server
  │                                   │
  │──── POST /mcp (notification) ────►│
  │◄─── 202 Accepted ─────────────────│
```

#### 什么是通知？

通知是一种**单向消息**，Client 告知 Server 某些事件或状态变化，但**不期望业务响应**。

#### 通知的特征

| 特征              | 说明                               |
| ----------------- | ---------------------------------- |
| **JSON-RPC 格式** | 无 `id` 字段（区别于普通请求）     |
| **HTTP 状态码**   | 202 Accepted（已接受但无响应内容） |
| **通信方向**      | 单向（Client → Server）            |
| **是否阻塞**      | 非阻塞，异步处理                   |
|                   |                                    |

#### 常见通知类型

**1. `notifications/initialized`**

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

- **用途**：告知 Server 初始化完成
- **时机**：在收到 `initialize` 响应后立即发送

**2. `notifications/cancelled`**

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/cancelled",
  "params": {
    "requestId": "original-request-id",
    "reason": "User cancelled operation"
  }
}
```

- **用途**：取消正在执行的操作
- **典型场景**：用户点击 AI 应用的"停止生成"按钮

**3. `notifications/progress`**

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/progress",
  "params": {
    "progressToken": "token-123",
    "progress": 75,
    "total": 100
  }
}
```

- **用途**：Client 向 Server 报告进度（较少使用）

#### 服务器处理流程

**Server 端行为**：

1. 接收通知消息
2. 立即返回 202（不等待处理完成）
3. 异步执行相应的内部操作（如停止任务、清理资源）
4. 不返回任何业务数据

**实际应用案例**：

> **场景**：用户在 ChatGPT 式的应用中请求 AI 生成长文章，Server 通过 SSE 流式推送内容。用户中途点击"停止生成"。
>
> **处理流程**：
>
> 1. Client 发送 `notifications/cancelled` 通知
> 2. Server 立即返回 202
> 3. Server 中止 AI 生成任务
> 4. SSE 流关闭
> 5. 客户端停止接收新内容

---

## MCP Session ID 深度解析

### 核心概念

**MCP Session ID** 是 HTTP Streamable 模式中用于**会话标识和状态管理**的关键机制。

### 设计原理

#### 问题背景

HTTP 协议本身是**无状态**的：

- 每个 HTTP 请求都是独立的
- Server 无法直接关联来自同一 Client 的多个请求
- 无法维护跨请求的上下文信息

但 MCP 协议需要**有状态**的通信：

- Client 和 Server 需要建立逻辑会话
- Server 需要维护每个会话的状态（初始化信息、工具列表、资源等）
- 支持长时间运行的操作（如 AI 生成任务）
- 管理 SSE 流式连接

#### 解决方案

通过 **Session ID** 在无状态的 HTTP 之上构建有状态的会话层：

```
┌─────────────────────────────────────────┐
│   Application Layer (MCP Protocol)      │  ← 有状态
│   - Tools, Resources, Prompts           │
│   - Long-running operations             │
├─────────────────────────────────────────┤
│   Session Layer (mcp-session-id)        │  ← 状态管理
│   - Session identification              │
│   - State tracking                      │
├─────────────────────────────────────────┤
│   Transport Layer (HTTP + SSE)          │  ← 无状态
│   - Request/Response                    │
│   - Streaming                           │
└─────────────────────────────────────────┘
```

\*\*注意：

- MCP Session ID 是**协议层面**的会话标识，专为 MCP 通信设计
- 它与**身份认证**（Authentication）无关，只是标识会话实例
- 实际应用中，可能需要同时使用 Session ID（会话管理）和 Token（身份认证）

## 总结

### HTTP Streamable 的优势

| 优势           | 说明                        |
| -------------- | --------------------------- |
| **跨网络通信** | 支持远程 Client 访问 Server |
| **标准协议**   | 基于 HTTP，兼容性好         |
| **流式能力**   | 通过 SSE 实现服务器推送     |
| **灵活响应**   | 支持单次响应和流式响应      |
| **会话管理**   | 通过 Session ID 维护状态    |

### 关键要点

1. **三阶段通信**：初始化 → 请求/响应 → 通知
2. **Session ID 核心**：在无状态 HTTP 上构建有状态会话
3. **双模式响应**：根据场景选择普通响应或 SSE 流式响应
4. **生命周期管理**：创建、使用、超时清理

### 适用场景

✅ **推荐使用**：

- 需要流式输出的场景（AI 生成、日志推送）

❌ **不推荐使用**：

- 本地进程通信 → 使用 Stdio 模式更简单
- 不需要流式输出 → 普通 HTTP API 即可
- 极低延迟要求 → 考虑 WebSocket

---

## 参考资源
