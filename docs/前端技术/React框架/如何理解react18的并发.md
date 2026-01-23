

### 为什么会引入并发的设计？

假设我们的应用里，React的render阶段需要耗时100ms。如果没有并发，那么在这100ms之内，用户的交互就会受到影响，因为浏览器的主线程被占用了，无法及时响应用户交互（如点击、输入等），也无法进行UI渲染更新。
因此React设计了一个"并发"模式。


### 什么时候加入的并发？

React是在16.0版本引入Fiber架构的设计，FiberNode支持在渲染阶段被中断、恢复，在此之前渲染阶段只能是一次性完成。
React 16.x开始提供Concurrent Mode作为实验性功能，但默认未开启。
React 18正式推出并发特性（Concurrent Features），通过`createRoot` API来启用并发渲染。

```tsx
// React 18 启用并发特性
ReactDOM.createRoot(document.getElementById("root")!)
  .render(
  	<React.StrictMode>
    	<App />
		</React.StrictMode>,
	);
```



### 什么是并发？
这里的并发并不是真正意义上的"多线程并发"，因为JavaScript还是单线程的。
所谓的并发，其实是React将大的渲染任务拆分成了多个小的任务，并加入时间切片的概念。在workLoop中，React每次循环都会通过`shouldYield()`判断当前是否已经占用主线程过久（默认阈值5ms，会根据优先级动态调整）。如果是，则yield让出线程权限，让浏览器去处理交互和渲染，然后通过scheduler重新调度剩余任务。整个过程看起来像并发，但并没有实现真正的多线程并发。

### 并发是怎么实现的？

React的渲染分2阶段：reconcile阶段和commit阶段。

- **reconcile阶段**：将JSX直接转化为Fiber树结构，对Fiber Node进行diff，标记需要更新的节点。此阶段可中断。
- **commit阶段**：根据标记的Fiber Node对DOM进行增删改操作，此阶段是原子性的，不可中断。

并发主要应用在reconcile阶段。在React遍历Fiber Node的workLoop中，每次循环都会调用`shouldYield()`判断是否需要让出执行权。如果需要，就交出线程权限，让浏览器去处理交互和渲染。

**SituationA**：

如果yield期间没有用户交互事件产生，也没有新的render任务，那么恢复执行时会继续处理被中断的任务。

![image-20260123161410884](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2026/01-23/image-20260123161410884.png)

**SituationB**：如果yield期间产生了高优先级的交互任务，scheduler会在`任务堆`中插入新的高优先级渲染任务。恢复执行时会优先处理高优先级任务，完成后再恢复之前低优先级的任务。

![image-20260123211655465](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2026/01-23/image-20260123211655465.png)
