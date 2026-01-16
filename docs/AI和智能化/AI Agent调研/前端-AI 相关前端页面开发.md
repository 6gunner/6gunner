

布局主要就是header, sidebar以及main-screen


sse相关的请求处理：eventsource来实现打字机效果；

event source默认支持一些event：
onopen
onmessage
onerror

然后我们可以自定义一些event，然后通过event.addEventListener来注册进去
比如：
```
eventSource.addEventListener("query", event => {})

eventSource.addEventListener("content", event => {})
```