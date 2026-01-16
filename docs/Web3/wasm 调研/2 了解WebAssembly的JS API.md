我们已经成功的将rust编译成了WebAssembly，并且在web端运行成功了。

下面就需要了解更多的WebAssembly的JS API了。



Firefox 58 可以直接从源码编译、实例化WebAssembly模块。使用的是下面两个方法

```
WebAssembly.compileStreaming()
WebAssembly.instantiateStreaming()
```



### 写个例子：以stream的方式加载wasm

从[官网](https://raw.githubusercontent.com/mdn/webassembly-examples/master/js-api-examples/simple.wasm)上下载一个wasm的文件，放到项目里：

![image-20220428202037203](https://ipic-coda.oss-cn-beijing.aliyuncs.com/20220428/image-20220428202037203.png)

然后在index.html里加上这么一段script

```
<script>
    var importObject = {
      imports: { imported_func: arg => console.warn(arg) }
    };
    WebAssembly.instantiateStreaming(fetch('simple.wasm'), importObject)
      .then(obj => obj.instance.exports.exported_func());

  </script>
```



为什么这么写？

看下simple.wasm的text format

![image-20220428202651489](https://ipic-coda.oss-cn-beijing.aliyuncs.com/20220428/image-20220428202651489.png)

第二行，它import了一个方法`imports.imported_func`，我们需要在js里提供这么一个方法。

第3~5行，它export了一个方法`exported_func`，并且调用了这个方法，传入参数42.



我们打开html，就可以看到，控制台warn输出了一个42.



### 不用stream的方式加载wasm

```
fetch('simple.wasm').then(response =>
  response.arrayBuffer()
).then(bytes =>
  WebAssembly.instantiate(bytes, importObject)
).then(results => {
  results.instance.exports.exported_func();
});
```

写法稍微有点不一样，是将wasm以二进制的格式传输，然后用`WebAssembly.instantiate`来实例化wasm模块。





## WebAssembly的内存模型

WebAssembly的内存是一块连续范围的、untyped的字节组成，是由模块内的指令来读取和存储的。

WebAssembly内存范围有限，不过每一个wasm模块的内存互相隔离的；也可以创建共享的内存区间，像window和worker线程之间那样，通过postMessage来传递消息。

在js里，一个Memory实例，通过这个方法来创建

```
var memory = new WebAssembly.Memory({initial:10, maximum:100});

// 1 = 64kb
```

memory实例的内存大小是可变的，

通过grow方法来扩大空间。

```
memory.grow(1);
```

如果memory超过了定义的最大上限，会抛出RangeError。

我们通过buffer的getter/setter方法来操作memory。



例子：



参考：https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API

