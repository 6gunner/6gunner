# useEffect 的执行机制

> 本文聚焦 useEffect 的整体执行流程和关键机制，不深入源码细节。

---

## 一、执行流程概览

`useEffect` 的执行横跨 React 的 **Render 阶段** 和 **Commit 阶段**，并在 Commit 完成后**异步执行**。

![image-20260125151322367](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2026/01-25/image-20260125151322367.png)

### 1.1 完整流程时序

```
Render 阶段 → Commit 阶段 → 浏览器绘制 → 异步执行 useEffect
```

---

## 二、Render 阶段

### 2.1 主要工作

在 Render 阶段，React 会：

1. **调用函数组件**，执行到 `useEffect(callback, deps)` 这行代码
2. **创建 Effect 对象**，包含 callback、deps、cleanup 等信息
3. **生成 Effect 链表**，挂载到对应的 Fiber 节点上

### 2.2 依赖比较

React 会对 `deps`（依赖数组）进行**浅比较**：

- **首次渲染**：标记 Effect 需要执行
- **更新渲染**：
  - 如果 deps 变化 → 标记 Effect 需要执行
  - 如果 deps 未变 → 跳过
- **无 deps**：每次都执行，也打上标记

### 2.3 打标记

如果 Effect 需要执行，React 会：

- 在对应的 **Fiber 节点**上打标记（`Passive` flag）
- 向上冒泡，在 **父 Fiber 节点**上也打标记
- 方便 Commit 阶段快速找到需要处理的节点

---

## 三、Commit 阶段

Commit 阶段分为三个子阶段，useEffect 的处理贯穿其中。

### 3.1 Before Mutation 阶段

**发生在 DOM 操作之前**，主要工作：

- 调用 `getSnapshotBeforeUpdate` 生命周期
- **调度 `useEffect` 的执行**：通过 Scheduler 注册 `flushPassiveEffects` 任务
- 此时还未修改 DOM

### 3.2 Mutation 阶段

1.**执行真正的 DOM 操作**：根据 Fiber 节点的标记，对 DOM 进行增删改

2.**会执行useLayoutEffect里的cleanup 函数**

### 3.3 Layout 阶段

**DOM 已更新，但浏览器还未绘制**，主要工作：

1. 触发Ref更新，**修改Ref引用对象**

2. **同步执行 `useLayoutEffect`**的setup方法：
3. 将带有 `HasUpdate` 标记的 `useEffect` 加入到一个全局的 **Pending 队列**（`pendingPassiveEffects`）。



### 3.4 Layout 完成后

Commit 阶段完成后：

1. **React 释放主线程**
2. **浏览器进行绘制**（用户看到新 UI）
3. **通过 MessageChannel 触发宏任务**，执行 `flushPassiveEffects`

---

## 四、useEffect 的异步执行

### 4.1 为什么用 MessageChannel？

- MessageChannel 创建的是**宏任务**，优先级低于微任务
- 确保在浏览器绘制**之后**执行，不阻塞渲染
- 比 `setTimeout` 更精确，没有 4ms 延迟

### 4.2 执行顺序

在 `flushPassiveEffects` 中，按以下顺序执行：

```
1. 执行所有 unmount 组件的 cleanup 函数
2. 执行所有需要 update 的组件的 cleanup 函数
3. 执行所有标记为需要执行的 Effect 的 callback 函数
```

### 4.3 关键特性

- **批量执行**：所有 Effect 集中在一个任务中处理
- **异步调度**：不阻塞浏览器渲染，提升性能
- **先清理后执行**：保证资源正确释放

---

## 五、useEffect vs useLayoutEffect

| 对比维度 | useEffect | useLayoutEffect |
|----------|-----------|-----------------|
| **执行时机** | Commit 完成后，浏览器绘制**之后**，异步执行 | Layout 阶段中，浏览器绘制**之前**，同步执行 |
| **是否阻塞渲染** | 否，不影响首次绘制 | 是，会延迟浏览器绘制 |
| **调度方式** | 宏任务（MessageChannel） | 同步执行 |
| **适用场景** | 数据获取、订阅、日志记录等 | 读取 DOM 布局、同步修改 DOM 避免闪烁 |
| **性能影响** | 优，不阻塞渲染 | 差，会让用户感觉卡顿 |

### 5.1 使用建议

- **默认使用 `useEffect`**：99% 的场景都应该用它
- **仅在必要时用 `useLayoutEffect`**：
  - 需要测量 DOM 尺寸/位置
  - 需要在用户看到之前同步修改 DOM（避免闪烁）
  - 需要在 DOM 更新后立即操作第三方库

---

## 六、常见问题

### 6.1 首次挂载会执行 useEffect 吗？

**会**。首次渲染时：

1. Render 阶段会创建 Effect 对象并标记
2. Commit 阶段完成后异步执行 callback
3. 此时没有 cleanup，直接执行 callback

### 6.2 为什么先执行 cleanup 再执行 callback？

确保副作用的正确清理：

```javascript
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
  
  return () => clearInterval(timer); // cleanup
}, []);
```

- 如果先执行新的 callback，旧的定时器还在运行
- 先执行 cleanup 清理旧副作用，再执行新 callback

### 6.3 多个 useEffect 的执行顺序

按照**在组件中声明的顺序**执行：

```javascript
useEffect(() => console.log('Effect 1'), []); // 先执行
useEffect(() => console.log('Effect 2'), []); // 后执行
```

### 6.4 deps 为空数组 vs 不传 deps

```javascript
useEffect(() => { /* ... */ }, []);    // 只在 mount 时执行一次
useEffect(() => { /* ... */ });        // 每次渲染都执行
```

- `[]` - 相当于 `componentDidMount`
- 不传 - 相当于 `componentDidMount` + `componentDidUpdate`

---

## 七、核心要点总结

✅ **useEffect 不会阻塞渲染** - 异步执行，用户体验更好  
✅ **批量执行所有 Effect** - 性能优化  
✅ **先 cleanup 后 callback** - 保证副作用正确清理  
✅ **通过 MessageChannel 调度** - 宏任务，在浏览器绘制后执行  
✅ **deps 浅比较决定是否执行** - 优化不必要的副作用  
✅ **优先使用 useEffect** - 仅必要时用 useLayoutEffect