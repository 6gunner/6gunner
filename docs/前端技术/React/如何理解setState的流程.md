---
sidebar_position: 4
---

# 如何理解setState的流程

## 一、核心概念

### setState/setCount的本质

`setState`（类组件）和`setCount`（Hooks）都是React中更新组件状态的API，但它们**都不是立即生效**的。

他们都会产生Update对象，然后将Update对象放到队列中，等待React Scheduler进行异步调度。

## 二、类组件：setState的完整流程

### 流程总览

```
this.setState({ value: 1 })
        │
        ▼
┌─────────────────────────────────────────┐
│  1. setState调用                         │
│     调用 this.updater.enqueueSetState()  │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  2. enqueueSetState                      │
│                                           │
│  - 创建一个update对象                    │
│  - 分配一个优先级                        │
│  - 放入fiber的updateQueue                │
│  - 触发调度                              │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  3. scheduleUpdateOnFiber                │
│                                           │
│  - 标记fiber的优先级                     │
│  - 检查是否需要立即更新                  │
│  - 安排更新任务                          │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  4. Render阶段                           │
│                                           │
│  beginWork：                             │
│  - 遇见类组件，调用updateClassComponent  │
│  - processUpdateQueue：合并所有update    │
│  - 计算出新state                         │
│                                           │
│  completeWork：                          │
│  - 收集effectList                        │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  5. Commit阶段                           │
│                                           │
│  - 遍历effectList                        │
│  - 执行DOM操作（UPDATE/INSERT/DELETE）   │
│  - 调用componentDidMount/Update          │
│  - 调用useLayoutEffect（同步）            │
│  - 调度useEffect（异步）                  │
└─────────────────────────────────────────┘
```

### 举例说明

```javascript
class Counter extends React.Component {
  state = { count: 0 };

  handleClick = () => {
    // 连续调用3次setState
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return <div onClick={this.handleClick}>{this.state.count}</div>;
  }
}
```

**执行流程：**

```
用户点击div
        │
        ▼
┌─────────────────────────────────────────┐
│  合成事件处理                            │
│  - 进入事件处理函数                      │
│  - 执行第1次setState：count=1           │
│    → 创建update1，放入队列               │
│  - 执行第2次setState：count=1           │
│    → 创建update2，放入队列               │
│  - 执行第3次setState：count=1           │
│    → 创建update3，放入队列               │
│  - 退出事件处理函数                      │
│  - React检测到3个update，合并为1次渲染   │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Render阶段                              │
│  - processUpdateQueue执行：              │
│    update1: count=0 → 1                 │
│    update2: count=1 → 2                 │
│    update3: count=2 → 3                 │
│  - 最终state: { count: 3 }              │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Commit阶段                              │
│  - 将div的文本从0改为3                   │
│  - 调用componentDidUpdate               │
└─────────────────────────────────────────┘

结果：页面显示3，3次setState只触发1次渲染
```

---

## 三、Hooks：setCount的完整流程

### 流程总览

```
setCount(1)
        │
        ▼
┌─────────────────────────────────────────┐
│  1. dispatchAction                       │
│     useState的dispatch方法               │
│                                           │
│  - 创建一个update对象                    │
│  - 分配一个优先级                        │
│  - 放入hook的queue                       │
│  - 触发调度                              │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  2. scheduleUpdateOnFiber                │
│                                           │
│  - 标记优先级                            │
│  - 安排更新任务                          │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  3. Render阶段                           │
│                                           │
│  - 重新执行函数组件                      │
│  - 执行到setCount(1)这行                 │
│  - 读取hook.memoizedState = 0            │
│  - 计算出新state                      │
│  - 下次渲染时：                          │
│    hook.memoizedState = 1
		...│
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  4. Commit阶段                           │
│   - 遍历effectList                        │
│  - 执行DOM操作（UPDATE/INSERT/DELETE）   │
...                     │
└─────────────────────────────────────────┘
```

### 举例说明

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 连续调用3次setCount
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return <div onClick={handleClick}>{count}</div>;
}
```

**执行流程：**

```
用户点击div
        │
        ▼
┌─────────────────────────────────────────┐
│  合成事件处理                            │
│  - 执行第1次setCount：count+1           │
│    → 创建update1，放入hook.queue         │
│  - 执行第2次setCount：count+1           │
│    → 创建update2，放入hook.queue         │
│  - 执行第3次setCount：count+1           │
│    → 创建update3，放入hook.queue         │
│  - 退出事件处理函数                      │
│  - React合并3个update，统一渲染          │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Render阶段                              │
│  - 重新执行Counter函数                   │
│  - 读取hook.memoizedState = 0           │
│  - 3个update都要处理：                   │
│    update1: 0 → 1                       │
│    update2: 1 → 2                       │
│    update3: 2 → 3                       │
│  - 返回UI，显示数字3                     │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Commit阶段                              │
│  - 将div的文本从0改为3                   │
│                      │
└─────────────────────────────────────────┘

结果：页面显示3，3次setCount只触发1次渲染
```

### 类组件 vs Hooks对比

| 对比维度     | 类组件（setState）           | Hooks（setCount）            |
| ------------ | ---------------------------- | ---------------------------- |
| **存储位置** | `fiber.updateQueue`          | `hook.queue`                 |
| **状态存储** | `fiber.memoizedState`        | `hook.memoizedState`         |
| **API方法**  | `enqueueSetState`            | `dispatchAction`             |
| **状态合并** | 自动合并prevState + newState | 需要传入reducer处理          |
| **更新函数** | `setState(prev => prev + 1)` | `setCount(prev => prev + 1)` |

---

## 四、批量更新规则

### 不同场景的更新策略

| 场景                           | 18是否批量 | 17是否支持 |
| ------------------------------ | ---------- | ---------- |
| **React合成事件**（onClick等） | ✅ 是      | ✅ 是      |
| **生命周期函数**               | ✅ 是      | ✅ 是      |
| **useEffect**                  | ✅ 是      | ✅ 是      |
| **setTimeout**                 | ✅ 是      | ❌ 否      |
| **Promise.then**               | ✅ 是      | ❌ 否      |
| **原生DOM事件**                | ✅ 是      | ❌ 否      |

> **React 17 vs React 18的区别：**
>
> - React 17：只有在React合成事件和生命周期中才批量更新
> - React 18：几乎所有场景都支持批量更新（自动批处理）

### 场景举例

#### 1. 合成事件：批量更新

```javascript
function App() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 3次setCount，合并为1次渲染
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    console.log(count); // 依然是0，不是3
  };

  return <div onClick={handleClick}>{count}</div>;
}
```

```
执行流程：
1. 用户点击div
2. 进入handleClick函数
3. 执行3次setCount，都放入队列
4. 退出handleClick函数
5. React检测到队列中有3个update
6. 合并为1次渲染
7. count变为3

结果：页面显示3，3次setCount只触发1次重新渲染
```

#### 2. setTimeout中的setState

在React 18中，setTimeout中的setState也会批量更新。

```javascript
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 在同一个setTimeout中调用3次setCount
    setTimeout(() => {
      setCount(count + 1);
      setCount(count + 1);
      setCount(count + 1);
    }, 1000);
  }, []);

  return <div>{count}</div>;
}
```

```
执行流程：
1. 组件首次渲染，count=0
2. useEffect执行，注册setTimeout
3. 1秒后，setTimeout执行
4. 由于闭包，count始终是0
5. 执行3次setCount(count + 1)
6. 3次都调用setCount(1)，相同值被合并

结果：最终count=1（3次setCount(1)合并为1次渲染）
```

同样的例子，在React17里，就不会触发批量更新

```javascript
import React from 'react';
import { useState, useEffect } from 'react';
export default function App() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 使用函数式setState获取最新值
    setTimeout(() => {
      setCount((c) => c + 1); // c=0 → 1
      setCount((c) => c + 1); // c=1 → 2
      setCount((c) => c + 1); // c=2 → 3
    }, 1000);
  };

  console.log('render.....');

  return (
    <div>
      {count}
      <button onClick={handleClick}>增加count</button>
    </div>
  );
}
```

```
执行流程：
1. 组件首次渲染，count=0
2. 点击按钮，触发handleClick
3. 1秒后，setTimeout执行
4. 执行3次函数式setState：
   - setCount(c => c + 1): 0 → 1 触发render
   - setCount(c => c + 1): 1 → 2 触发render
   - setCount(c => c + 1): 2 → 3 触发render
结果：最终count=3（单数3次更新会造成3次渲染）
```

#### 3. dom原生事件

```jsx
const buttonRef = React.useRef(null);

// 17不支持批量,18都支持
useEffect(() => {
  const handleNativeClick = () => {
    setCount((c) => c + 1); // c=0 → 1
    setCount((c) => c + 1); // c=1 → 2
    setCount((c) => c + 1); // c=2 → 3
  };
  if (buttonRef.current) {
    buttonRef.current.addEventListener('click', handleNativeClick);
  }
  return () => {
    if (buttonRef.current) {
      buttonRef.current.removeEventListener('click', handleNativeClick);
    }
  };
}, []);
```

---

## 五、setState的合并机制（重点）

### 常见的误解

很多人认为"setState会合并"是这样的：

```
误解：存储阶段就合并
this.setState({ a: 1 });
this.setState({ b: 2 });
// 误解：{ a: 1, b: 2 } 直接存到state里

实际上：存储的是update对象链表
updateQueue = [update1, update2]
update1 = { action: { a: 1 } }
update2 = { action: { b: 2 } }
```

**关键结论：React 18的合并发生在"执行阶段"，而非"存储阶段"。**

### 存储阶段：只负责"收集"

```
用户调用3次setState：
this.setState({ a: 1 });
this.setState({ b: 2 });
this.setState({ c: 3 });
```

**存储阶段只做一件事：创建update对象，放入队列**

```
┌─────────────────────────────────────────┐
│  存储阶段                                │
│                                           │
│  this.setState({ a: 1 })                 │
│    → 创建 update1                        │
│    → update1.action = { a: 1 }           │
│    → 放入 updateQueue                    │
│                                           │
│  this.setState({ b: 2 })                 │
│    → 创建 update2                        │
│    → update2.action = { b: 2 }           │
│    → 放入 updateQueue                    │
│                                           │
│  this.setState({ c: 3 })                 │
│    → 创建 update3                        │
│    → update3.action = { c: 3 }           │
│    → 放入 updateQueue                    │
│                                           │
│  最终 updateQueue 结构：                  │
│  ┌───────────────────────────────────┐   │
│  │ pending: update1 → update2 → update3││
│  └───────────────────────────────────┘   │
│                                           │
│  ⚠️ 注意：没有发生任何"合并"              │
│  3个update对象独立存在                    │
└─────────────────────────────────────────┘
```

### 执行阶段：依次执行每个update

合并真正发生在Render阶段的`processUpdateQueue`函数中。

```
执行阶段（Render阶段）：
        │
        ▼
┌─────────────────────────────────────────┐
│  processUpdateQueue执行                  │
│                                           │
│  baseState = { count: 0 }               │
│  pending = [update1, update2, update3]  │
│                                           │
│  依次执行每个update：                     │
│                                           │
│  update1: action = { a: 1 }              │
│    → 执行: { ...baseState, ...action }   │
│    → baseState = { a: 1 }                │
│                                           │
│  update2: action = { b: 2 }              │
│    → 执行: { ...baseState, ...action }   │
│    → baseState = { a: 1, b: 2 }          │
│                                           │
│  update3: action = { c: 3 }              │
│    → 执行: { ...baseState, ...action }   │
│    → baseState = { a: 1, b: 2, c: 3 }    │
│                                           │
│  最终 memoizedState = { a: 1, b: 2, c: 3 }│
└─────────────────────────────────────────┘
```

### 对比：存储 vs 执行

| 阶段         | 做什么                   | 结果                                        |
| ------------ | ------------------------ | ------------------------------------------- |
| **存储阶段** | 创建update对象，放入队列 | `updateQueue = [update1, update2, update3]` |
| **执行阶段** | 依次执行每个update       | `memoizedState = { a: 1, b: 2, c: 3 }`      |

### 为什么这样设计？

```
好处1：支持函数式setState

this.setState(prev => ({ count: prev.count + 1 }));
this.setState(prev => ({ count: prev.count + 1 }));

// 如果存储阶段就合并，就无法拿到prev值
// 必须等前一个update执行完，才能拿到prev

好处2：支持优先级插队

update1: SyncLane（高优先级）
update2: DefaultLane（低优先级）

// 可以先执行update1，暂停
// 等update1提交后，再执行update2
```

### 一个直观的例子

```javascript
class App extends React.Component {
  state = { count: 0, name: 'React' };

  handleClick = () => {
    // 连续调用4次setState
    this.setState({ count: 1 });
    this.setState((prev) => ({ count: prev.count + 1 }));
    this.setState({ name: 'Vue' });
    this.setState((prev) => ({ count: prev.count + 1 }));
  };

  render() {
    return (
      <div>
        {this.state.count} - {this.state.name}
      </div>
    );
  }
}
```

**执行过程：**

```
存储阶段：
┌─────────────────────────────────────────┐
│ update1: action = { count: 1 }          │
│ update2: action = (prev) => ({ count: prev.count + 1 }) │
│ update3: action = { name: 'Vue' }       │
│ update4: action = (prev) => ({ count: prev.count + 1 }) │
│                                           │
│ updateQueue.pending =                    │
│ update1 → update2 → update3 → update4    │
└─────────────────────────────────────────┘

执行阶段（Render阶段）：
┌─────────────────────────────────────────┐
│ baseState = { count: 0, name: 'React' } │
│                                           │
│ 执行 update1:                            │
│   { ...baseState, count: 1 }             │
│   → baseState = { count: 1, name: 'React' } │
│                                           │
│ 执行 update2:                            │
│   action(prev) = ({ count: 1 + 1 })      │
│   → baseState = { count: 2, name: 'React' } │
│                                           │
│ 执行 update3:                            │
│   { ...baseState, name: 'Vue' }          │
│   → baseState = { count: 2, name: 'Vue' } │
│                                           │
│ 执行 update4:                            │
│   action(prev) = ({ count: 2 + 1 })      │
│   → baseState = { count: 3, name: 'Vue' } │
│                                           │
│ 最终 state = { count: 3, name: 'Vue' }   │
└─────────────────────────────────────────┘
```

### 总结：合并的真正含义

| 误解                                | 正确理解                                              |
| ----------------------------------- | ----------------------------------------------------- |
| "合并"是把两个对象merge成一个       | "合并"是在执行阶段依次处理每个update                  |
| 存储阶段就完成了state的合并         | 存储阶段只创建update对象                              |
| `setState({ a: 1 })`会直接修改state | setState只是把update放入队列，state在Render阶段才更新 |

**核心要点：**

1. **存储阶段**：创建update对象，放入链表
2. **执行阶段**：依次执行每个update，计算最终state
3. **合并的本质**：不是对象合并，而是"批量执行多次更新"

### 类组件：updateQueue机制

```
updateQueue的结构：
┌─────────────────────────────────────────┐
│  fiber.updateQueue                      │
│  ├─ baseState: { count: 0 }             │  基础状态
│  ├─ firstBaseUpdate: null               │  基础队列头
│  ├─ lastBaseUpdate: null                │  基础队列尾
│  ├─ shared.pending: update → update → null │  待处理队列
│  └─ callbacks: null                     │  回调队列
└─────────────────────────────────────────┘
```

**处理过程：**

```
updateQueue.shared.pending = [update1, update2, update3]
        │
        ▼
┌─────────────────────────────────────────┐
│  processUpdateQueue执行                  │
│                                           │
│  1. 取出pending队列中的所有update        │
│     update1: action = { count: 1 }       │
│     update2: action = { count: 2 }       │
│     update3: action = { count: 3 }       │
│                                           │
│  2. 依次处理每个update                   │
│     baseState = { count: 0 }             │
│     update1: { ...baseState, count: 1 }  │
│     update2: { ...baseState, count: 2 }  │
│     update3: { ...baseState, count: 3 }  │
│                                           │
│  3. 最终结果                             │
│     { count: 3 }         │
└─────────────────────────────────────────┘
```

### Hooks：hook.queue机制

```
hook.queue的结构：
┌─────────────────────────────────────────┐
│  hook.queue                             │
│  ├─ pending: update → update → null     │  待处理队列
│  ├─ lastRenderedReducer: reducer        │  当前reducer
│  └─ lastRenderedState: 0                │  上次渲染的state
└─────────────────────────────────────────┘
```

**处理过程：**

```
hook.queue.pending = [update1, update2, update3]
        │
        ▼
┌─────────────────────────────────────────┐
│  重新执行函数组件                        │
│                                           │
│  1. 取出queue中的所有update              │
│     update1: action = (prev) => prev + 1 │
│     update2: action = (prev) => prev + 1 │
│     update3: action = (prev) => prev + 1 │
│                                           │
│  2. 依次处理每个update                   │
│     currentState = 0                     │
│     update1: reducer(0, action) = 1      │
│     update2: reducer(1, action) = 2      │
│     update3: reducer(2, action) = 3      │
│                                           │
│  3. 最终结果                             │
│     hook.memoizedState = 3               │
└─────────────────────────────────────────┘
```

---

## 六、完整流程总结

### 类组件 setState 流程

```
this.setState({ value: 1 })
        │
        ▼
┌─────────────────┐
│ 放入updateQueue │ enqueueSetState
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ 触发调度        │ scheduleUpdateOnFiber
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Render阶段      │ processUpdateQueue计算新state
│ - 合并update    │
│ - Diff算法      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Commit阶段      │ 执行DOM操作
│ - DOM操作       │
│ - 生命周期      │
└─────────────────┘
        │
        ▼
      页面更新
```

### Hooks setCount 流程

```
setCount(1)
        │
        ▼
┌─────────────────┐
│ 放入hook.queue │ dispatchAction
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ 触发调度        │ scheduleUpdateOnFiber
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Render阶段      │ 重新执行函数组件
│ - 执行函数      │
│ - 读取hook状态  │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Commit阶段      │ 执行DOM操作
│ - DOM操作       │
│ - useEffect     │
└─────────────────┘
        │
        ▼
      页面更新
```

---

## 七、核心要点

| 要点           | 说明                                                |
| -------------- | --------------------------------------------------- |
| **异步更新**   | setState/setCount不会立即更新，而是放入队列等待调度 |
| **批量更新**   | 合成事件和生命周期中会合并多次更新                  |
| **Render阶段** | 计算新state，构建新Fiber树                          |
| **Commit阶段** | 执行DOM操作，调用生命周期/Effect                    |
| **可中断**     | Fiber架构支持时间切片，避免阻塞主线程               |

---

## 八、常见问题

### Q1：setState是同步还是异步？

**答：** setState是异步的。调用setState后，不会立即更新state，而是放入队列等待调度。可以通过callback或useEffect获取更新后的值。

```javascript
this.setState({ value: 1 });
console.log(this.state.value); // 旧值

this.setState({ value: 1 }, () => {
  console.log(this.state.value); // 新值
});
```

### Q2：为什么多次setState会合并？

**答：** 这是React的优化策略。在同一个事件处理函数中，多次setState会被合并为一次渲染，避免不必要的性能开销。

```javascript
onClick = () => {
  this.setState({ a: 1 });
  this.setState({ b: 2 });
  this.setState({ c: 3 });
  // 最终只会触发1次渲染
};
```

### Q3：setTimeout中的setState会批量更新吗？

**答：** 分不同的版本。

在React17里，不会批量更新，会触发两次渲染；

```jsx
handleSetTimeoutClick = () => {
  setTimeout(() => {
    this.setState({
      count: this.state.count + 1,
    });
    console.log(this.state.count);
    this.setState({
      count: this.state.count + 1,
    });
    console.log(this.state.count);
  }, 500);
};
```

```
render
1
render
2
```

但是在React18后，会，几乎所有场景都支持批量更新；

```tsx
handleAsyncClick = () => {
  setTimeout(() => {
    this.setState({
      count1: this.state.count1 + 1,
    });
    this.setState({
      count2: this.state.count2 + 1,
    });
  }, 1000);
};
```

```
0
0
触发re-render.....
```

### Q4：类组件和Hooks的setState有什么区别？

**答：** 两者在更新流程上基本一致，都是放入队列 → 触发调度 → Render → Commit。

| **特性**     | **类组件 (Class)**                    | **函数组件 (Hooks)**             |
| ------------ | ------------------------------------- | -------------------------------- |
| **状态存储** | `Fiber.memoizedState` (即 state 对象) | `Hook.memoizedState` (Hook 链表) |
| **更新队列** | `Fiber.updateQueue`                   | `Hook.queue.pending`             |
| **计算逻辑** | `Object.assign` 浅合并                | `basicStateReducer` 覆盖替换     |

**1.在 `beginWork` 阶段，React 处理它们的方式有所不同**

- 类组件：更新队列存储在fiber.updateQueue，当执行更新时，React 遍历链表，用 `Object.assign` 的逻辑累加出新结果。

- Hooks：Hooks 的状态是存储在 hook.memoizedState上的，然后更新队列是维护在`Hook.queue.pending`上。当更新时，React找到这个hook对象，取出hook.queue.pending里所有的Update对象，不断调用Update，计算新值，然后赋值到hook.memoizedState上

  2.**值的更新机制不同**

- 类组件的setState调用会将参数和已有的state进行合并
- hooks里的dispatchAction会全量替换state

**3.API不同**

- setState支持异步callback，

- useState的dispatch方法不支持callback，只能结合useEffect实现上述功能

### Q5：useEffect和setState的执行时机有什么区别？

为了让你更直观地理解，我们可以看这个时间线：

| **步骤** | **阶段**            | **动作**                                            | **调度器角色**                   |
| -------- | ------------------- | --------------------------------------------------- | -------------------------------- |
| **1**    | **调度 (Schedule)** | `setCount` 触发，Update 对象排队。                  | 决定什么时候开始算账（Render）。 |
| **2**    | **渲染 (Render)**   | **处理 Update 链表**，计算新状态，生成新 Fiber 树。 | 监听是否有更高优先级的任务插入。 |
| **3**    | **提交 (Commit)**   | 瞬间把变化应用到真实 DOM 上。                       | 同步执行，不可中断。             |
| **4**    | **绘制 (Paint)**    | 浏览器将 DOM 的变化画在屏幕上。                     | 浏览器行为。                     |
| **5**    | **副作用 (Effect)** | **执行 useEffect callback**。                       | 在浏览器空闲时异步触发。         |
