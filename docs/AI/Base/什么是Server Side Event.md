---
title: 什么是 Server-Sent Events (SSE)
sidebar_label: SSE
description: 深入理解 SSE（Server-Sent Events）服务器推送事件协议，包括核心特征、技术规范和使用场景
tags: [SSE, Server-Sent Events, 实时通信, HTTP, 流式传输]
keywords: [SSE, Server-Sent Events, 服务器推送, 实时通信, 流式传输, HTTP协议]
sidebar_position: 0
slug: /ai/base/sse
---

## What

### 定义

SSE（Server-Sent Events）全称**服务器推送事件**,是 HTML5 引入的一种服务器向客户端推送实时数据的 Web 标准。它是基于 HTTP 协议的**单向通信**机制，允许服务器主动向浏览器推送数据流。

### 核心特征

- **协议基础**：基于 HTTP/1.1 协议，不需要协议升级
- **通信方向**：单向通信（服务器 → 客户端）
- **连接方式**：长连接（HTTP Keep-Alive）
- **数据格式**：纯文本格式，以 `text/event-stream` 作为 MIME 类型
- **传输模式**：流式传输（Streaming）

### 技术规范

#### 1. 客户端请求头

客户端发起连接时必须声明：

```http
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

#### 2. 服务器响应头

服务器返回时需要标明内容类型：

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

#### 3. 数据格式规范

服务器推送的每条消息必须遵循以下格式：

**基础格式**：

```
data: 消息内容\n\n
```

**完整格式**（包含所有可选字段）：

```
id: 消息ID
event: 事件类型
data: 第一行数据
data: 第二行数据
retry: 重连时间（毫秒）

```

**格式说明**：

- `id`：消息的唯一标识符，用于断线重连时告诉服务器上次接收到哪条消息
- `event`：自定义事件类型，默认为 `message`
- `data`：实际数据内容，可以有多行，客户端会用 `\n` 拼接
- `retry`：客户端重连的等待时间（毫秒）
- **重要**：每条消息必须以**两个换行符** `\n\n` 结尾

**示例**：

```
id: 1
event: userUpdate
data: {"userId": 123, "status": "online"}
retry: 3000

id: 2
data: {"temperature": 25.5}

```

---

## Why - 为什么需要 SSE？

### 传统方案的问题

在 SSE 出现之前，实现服务器推送主要有以下方式：

| 方案                       | 原理                                 | 缺点                                                    |
| -------------------------- | ------------------------------------ | ------------------------------------------------------- |
| **轮询（Polling）**        | 客户端定时发送请求查询新数据         | • 大量无效请求<br/>• 实时性差<br/>• 服务器压力大        |
| **长轮询（Long Polling）** | 客户端请求后服务器挂起连接直到有数据 | • 连接频繁建立/销毁<br/>• 实现复杂<br/>• 资源消耗大     |
| **WebSocket**              | 全双工通信协议                       | • 需要协议升级<br/>• 实现复杂<br/>• 对代理/防火墙不友好 |

### SSE 的优势

1. **简单易用**：
   - 原生浏览器 API（`EventSource`）
   - 不需要额外的库或框架
   - 代码量少，学习成本低

2. **兼容性好**：
   - 基于 HTTP 协议，无需协议升级
   - 可以通过现有的 HTTP 基础设施（负载均衡、CDN、代理）
   - 天然支持 HTTP 认证（Bearer Token、Cookie）

3. **自动重连**：
   - 浏览器内置断线重连机制
   - 支持通过 `Last-Event-ID` 恢复中断的消息

4. **轻量高效**：
   - 单向通信，协议开销小
   - 适合服务器推送场景

### 局限性

1. **单向通信**：只能服务器向客户端推送，客户端不能通过同一连接发送数据
2. **并发限制**：浏览器对同一域名的 HTTP 连接数有限制（通常 6 个）
3. **代理支持**：部分老旧代理服务器可能不支持长连接
4. **二进制数据**：只支持文本数据（UTF-8 编码）

#### Nginx 配置

SSE 需要特殊的 Nginx 配置才能正常工作：

```nginx
location /sse {
    # 禁用响应缓冲（核心配置）
    proxy_buffering off;

    # 避免 408 Request Timeout
    proxy_read_timeout 3600s;

    # 确保 Connection 头正确传递
    proxy_set_header Connection '';

    # 开启 HTTP/1.1
    proxy_http_version 1.1;

    # 禁用 gzip 压缩（可选，但推荐）
    gzip off;

    # 传递必要的头信息
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    proxy_pass http://backend;
}
```

**关键点解释**：

- `proxy_buffering off`：禁用缓冲，否则数据会被 Nginx 缓存而不是实时推送
- `proxy_read_timeout`：设置长超时时间，避免连接被提前关闭
- `proxy_http_version 1.1`：使用 HTTP/1.1 支持长连接

#### Apache 配置

```apache
<Location /sse>
    # 禁用输出缓冲
    SetEnv proxy-sendcl 0

    # 长超时
    ProxyTimeout 3600
</Location>
```
