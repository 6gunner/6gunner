
http streamable既可以支持application/json，又可以支持text/stream
sse必须接收text/stream的传输；

application/json的格式是真json-rpc的调用，一般用于：

初始化连接 (`initialize`)
获取工具列表 (`tools/list`)



```
// 请求
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}

// 响应
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [...]
  }
}
```

`text/event-stream` - 流式数据，应用于流式数据响应

```
data: {"type": "progress", "value": 25}

data: {"type": "progress", "value": 50}

data: {"type": "result", "data": "final output"}
```

