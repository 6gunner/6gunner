## sse协议：

@microsoft/fetch-event-source 使用的是 HTTP/1.1 协议，具体实现了 Server-Sent Events (SSE) 规范。

几个关键的协议特点：

1. 请求头:
```
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

2. 响应头:
```
Content-Type: text/event-stream
  Cache-Control: no-cache
Connection: keep-alive
```

3. 数据格式:
服务器发送的数据需要遵循 SSE 的格式规范：
```
data: 消息内容\n\n
```

SSE 是基于 HTTP 的单向通信协议，只能服务器向客户端推送数据。与 WebSocket 不同，它不需要切换协议（WebSocket 需要从 HTTP 升级到 WS 协议），始终使用 HTTP 协议通信。

这种设计有几个优势：
- 简单易实现，不需要特殊的代理配置
- 自动重连机制
- 可以通过现有的 HTTP 基础设施传输
- 天然支持 HTTP 的认证机制

不过也有一些局限：
- 只支持服务器到客户端的单向通信
- 对并发连接数有限制（浏览器对同一域名的 HTTP 连接数有限制）
- 一些代理服务器可能不支持长连

**nginx可以支持：**

```
# 禁用响应缓冲
proxy_buffering off;

# 避免 408 Request Timeout
proxy_read_timeout 3600s;

# 确保 Connection 头正确传递
proxy_set_header Connection '';

# 开启 HTTP/1.1
proxy_http_version 1.1;
```

