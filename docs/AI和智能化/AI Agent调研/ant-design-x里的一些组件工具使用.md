
useXAgent:  会返回一个agent代理。可以传入一些key，默认接入了大模型，也可以自定义请求处理。

useXChat：通过agent来获取会话。传入agent，可以返回`[messages, onRequest]`等对象

- messages是历史聊天记录

- onRequest方法是用来给客户端发送消息用的


XStream： 可以将SSE的readableStream转化为record。

ReadableStream是JS里的一个内置对象,  可以异步遍历。默认fetch().body就是一个ReadableStream对象；

```js

function getSomeSource() {
	return fetch('/xxx');
}

const stream = await getSomeSource().body);

for await (const chunk of stream) {
  // Do something with each 'chunk'
}

```


ReadableStream的API

```js
{
    // 必选，流创建时调用
    start(controller) {
        // 在这里可以:
        // 1. 设置初始状态
        // 2. 通过 controller.enqueue() 加入初始数据
        // 3. 如果没有更多数据，调用 controller.close()
        // 4. 如果有错误，调用 controller.error()
    },

    // 可选，当流的内部队列不满时被调用
    pull(controller) {
        // 在这里可以:
        // 1. 生成新的数据块
        // 2. 通过 controller.enqueue() 加入新数据
        // 3. 如果没有更多数据，调用 controller.close()
    },

    // 可选，当流被取消时调用
    cancel(reason) {
        // 清理资源
    },

    // 可选，用于类型化数组流
    type,
    
    // 可选，仅在 type 为 "bytes" 时使用
    autoAllocateChunkSize
}
```


start和pull的区别：

start会在刚建立连接的时候被调用，一般使用场景比如：`初始化资源`，`打开文件`等。

pull会每次在需要数据的时候，重复被读取。pull会由系统自动控制调用时机，会在内部数据队列不足时去被触发。一般我们使用的场景比如：`分块读取数据`， `从网络获取数据`等。

```js
// 模拟一个大文件分块读取的场景
class FileChunkReader {
  constructor(totalSize, chunkSize) {
    this.totalSize = totalSize; // 文件总大小
    this.chunkSize = chunkSize; // 每块大小
    this.currentPosition = 0; // 当前读取位置
  }

  createStream() {
    return new ReadableStream({
      // start 只调用一次，用于初始化
      start: controller => {
        console.log('开始读取文件，总大小:', this.totalSize);
        // start 中不一定要立即放入数据
        // 这里我们只做初始化工作
      },

      // pull 会被反复调用，用于按需提供数据
      pull: controller => {
        // 检查是否还有数据要读
        if (this.currentPosition >= this.totalSize) {
          console.log('文件读取完成');
          controller.close();
          return;
        }

        // 计算这次要读取的块大小
        const size = Math.min(this.chunkSize, this.totalSize - this.currentPosition);

        // 模拟从文件读取数据
        const chunk = this.readChunk(size);

        // 放入队列
        controller.enqueue(chunk);
        console.log(`读取位置 ${this.currentPosition - size} -> ${this.currentPosition}, ` + `块大小: ${size}`);
      },

      // 取消时的清理工作
      cancel: () => {
        console.log('流被取消');
        this.cleanup();
      },
    });
  }

  // 模拟从文件读取数据
  readChunk(size) {
    const chunk = new Uint8Array(size).fill(this.currentPosition % 256);
    this.currentPosition += size;
    return chunk;
  }

  cleanup() {
    // 清理资源
    this.currentPosition = 0;
  }
}

// 使用示例
const fileReader = new FileChunkReader(
  1024 * 1024, // 1MB 总大小
  64 * 1024, // 64KB 每块
);

const stream = fileReader.createStream();

// 读取数据
async function readFile() {
  const reader = stream.getReader();
  let totalRead = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalRead += value.length;
      console.log(`已读取: ${totalRead} bytes ` + `(${((totalRead / (1024 * 1024)) * 100).toFixed(2)}%)`);
    }
  } finally {
    reader.releaseLock();
  }
}

// 开始读取
readFile().catch(console.error);

```

