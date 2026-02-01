---
sidebar_position: 1
---

## 一、为什么需要Fiber？

在React 15时代，Reconciliation（协调）过程采用**同步递归**的方式遍历整个虚拟DOM树。这种方式存在一个致命问题：**一旦开始 Diff，就无法中断**。这样就会导致浏览器掉帧：

**问题演示：**

```
假设页面有1000个节点需要更新：

场景：用户在输入框打字，同时后台有1000个节点在更新

React 15的表现：
├── 浏览器主线程被占用 200ms
├── 输入框卡顿、无响应
├── 用户体验：明显掉帧

```

**掉帧问题的根源**

```javascript
// React 15的递归遍历（简化版）
function reconcile(children) {
  children.forEach(child => {
    if (child.type changed) {
      // 销毁重建整个子树
    } else {
      // 递归处理子节点
      reconcile(child.children);
    }
  });
  // 这个过程会一直执行到完成，中途不能暂停
}
```

### Fiber的解决方案

怎么样才能进行优化呢？怎么才能让高优先级的更新（如用户输入）应该能够打断低优先级的更新（如列表渲染）?

**Fiber的核心思路：**

| 维度     | React 15         | React 16+ Fiber     |
| -------- | ---------------- | ------------------- |
| 数据结构 | 虚拟DOM树        | Fiber链表           |
| 遍历方式 | 递归（调用栈）   | 迭代（while循环）   |
| 执行模式 | 同步（不可中断） | 异步（可中断）      |
| 时间切片 | 无               | 有（Scheduler控制） |

**优化后的效果演示：**

```
React 16+ Fiber的表现：
├── 处理100个节点 → 暂停（16ms时间片用完）
├── 浏览器有时间处理输入
├── 继续处理下100个节点
├── 用户体验：无感知卡顿
```

---

## 二、什么是Fiber？

### 本质定义

**Fiber本质是就是一个新的数据结构，增加了很多属性，其目的是为了：**

**1.够适配React的调度策略**

**2.代表了最小的执行单元**

### Fiber节点的核心属性

```typescript
type Fiber = {
  // === 链表结构 ===
  child: Fiber | null; // 第一个子节点
  sibling: Fiber | null; // 下一个兄弟节点
  return: Fiber | null; // 父节点

  // === 双树机制 ===
  alternate: Fiber | null; // 指向另一棵树的对应节点

  // === 状态与输入 ===
  pendingProps: any; // 待更新的属性
  memoizedProps: any; // 上次渲染的属性
  updateQueue: UpdateQueue; // 更新队列
  memoizedState: any; // 上次生成的状态

  // === 副作用标记 ===
  flags: Flags; // 当前节点的副作用
  firstEffect: Fiber | null; // 副作用链表头
  lastEffect: Fiber | null; // 副作用链表尾
  nextEffect: Fiber | null; // 下一个副作用节点

  // === 优先级（React 17+） ===
  lanes: Lanes; // 当前节点优先级
  childLanes: Lanes; // 子节点优先级
};
```

### 链表结构图解

```
传统树结构：                  Fiber链表结构：

      div                         div ──┐
     /  │  \                           │
    ul  p   h1                         ul ──┐
    │                                  │     │
    li ──┬── li                        li ──┼── li
         │                            sibling
         li                              │
                                         p ──┐
                                              │
                                              h1

遍历方式：递归调用栈         遍历方式：next指针迭代，先子后兄
```

---

## 三、双Fiber树机制

双Fiber树是理解React Fiber架构的**核心**。

### 为什么需要两棵树？

| 问题                   | 解决方案                       |
| ---------------------- | ------------------------------ |
| Diff过程中需要参照旧树 | current树保留旧UI              |
| 不能直接修改屏幕上的UI | workInProgress在内存中构建新UI |
| 需要快速回退和恢复     | alternate指针连接两棵树        |

### 两棵树的关系

```javascript
// 每个Fiber节点都有alternate指针
{
  type: 'div',
  child: { type: 'ul', ... },
  sibling: { type: 'p', ... },
  return: { type: 'root', ... },

  // 🔑 关键指针：指向另一棵树的对应节点
  alternate: fiberFromOtherTree,
}
```

### 完整工作流程图

```
时间线：

初始渲染:
─────────────────────────────────────────────────────────────►

currentTree: null  ─────────────────────────► [树A]
workInProgress:    [树A] ──────────────────► null
                                              (提交后workInProgress变null)


更新渲染:
─────────────────────────────────────────────────────────────►

currentTree: [树A] ───────────────► [树A]
workInProgress:    [树A'] ───────► [树B]
                    ▲ Diff在这里进行

提交后:
currentTree: [树B]  ◄──────────────── (A被回收)
workInProgress: null
```

## 四、FiberTree的遍历流程

### Render阶段

Render阶段核心是通过一个可中断的循环，遍历Fiber树：对每个节点执行`beginWork`和`completeWork`。

其中`beginWork`函数里会执行Diff算法；`completeWork`函数里会标记副作用，最终收集出`effectList`。

遍历的顺序是：`父 → 子 → 子 → ... → 回溯 → 兄弟 → 兄弟的子 → ...`

```javascript
// workLoop简化版
function workLoop() {
  let nextUnitOfWork = workInProgressRoot;

  while (nextUnitOfWork) {
    // 1. 处理当前节点
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 2. 检查是否需要中断（时间片用完）
    if (shouldYield()) {
      break; // 暂停，下次调度继续
    }
  }
}
```

**performUnitOfWork做了什么**

```ts
function performUnitOfWork(workInProgress) {
  // beginWork：处理当前节点，可能返回子节点
  const next = beginWork(workInProgress);

  // 如果没有子节点，开始回溯
  if (next === null) {
    return completeUnitOfWork(workInProgress);
  }

  return next;
}
```

#### beginWork流程详解

`beginWork`是**Diff算法发生的地方**，它的核心逻辑是判断如何处理当前节点：

```javascript
function beginWork(current, workInProgress) {
  // 情况1：首次渲染（current为null）
  if (current === null) {
    workInProgress.child = createChild(workInProgress);
    return workInProgress.child;
  }

  // 情况2：更新渲染
  const nextChildren = workInProgress.pendingProps.children;

  // 判断是否需要更新
  if (hasScheduledUpdate(workInProgress)) {
    // 类型改变了：销毁重建
    if (workInProgress.type !== current.type) {
      workInProgress.child = createChild(workInProgress);
      return workInProgress.child;
    }

    // 类型没变，尝试复用
    if (shouldPropsChange(workInProgress.props, current.props)) {
      // 执行Diff算法，对比子节点
      workInProgress.child = reconcileChildren(
        current.child, // 旧子节点链表
        workInProgress, // 新父节点
        nextChildren // 新子节点列表
      );
      return workInProgress.child;
    }

    // props没变，完全复用
    cloneChildFibers(current, workInProgress);
    return workInProgress.child;
  }

  // 没有更新，复用子树
  bailoutWork(current, workInProgress);
  return workInProgress.child;
}
```

#### completeUnitOfWork流程详解

`completeUnitOfWork`负责**收集DOM副作用到effectList**，并将其关联到父节点：

**⚠️ 注意区分：**

- **effectList**：在`completeWork`阶段收集，存储有DOM变更的节点
- **useLayoutEffect/useEffect**：在`beginWork`阶段收集，存储到`fiber.updateQueue`中

```javascript
function completeUnitOfWork(workInProgress) {
  let current = workInProgress.alternate;

  // 1. 创建真实DOM（HostComponent）
  if (typeof workInProgress.type === 'string') {
    const dom = createDOM(workInProgress.props);
    workInProgress.stateNode = dom;

    // 关联DOM到父节点
    // 此时只是在Fiber中建立引用关系，真实DOM操作在commit阶段执行
    if (workInProgress.return) {
      workInProgress.return.stateNode.appendChild(dom);
    }
  }

  // 2. 收集副作用到当前节点的effectList
  // 每个节点收集自己的副作用和子节点的副作用
  if (workInProgress.flags) {
    const returnFiber = workInProgress.return;

    // 如果父节点还没有effectList，创建新的
    if (returnFiber.firstEffect === null) {
      returnFiber.firstEffect = workInProgress;
    } else {
      // 否则将当前节点，追加父节点的effectList的末尾
      returnFiber.lastEffect.nextEffect = workInProgress;
    }
    // 更新末尾指针
    returnFiber.lastEffect = workInProgress;
  }

  // 3. 继续处理兄弟节点
  if (workInProgress.sibling) {
    return workInProgress.sibling;
  }
```

### Commit阶段：执行DOM操作

Commit阶段是**同步执行**的（不可中断），分为三个子阶段：

```javascript
function commitRoot(root) {
  const finishedWork = root.current.alternate;

  // 阶段1：BEFORE_MUTATION
  // - 获取DOM节点信息
  // - 调用getSnapshotBeforeUpdate
  beforeMutation(finishedWork);

  // 阶段2：MUTATION（同步、阻塞）
  // - 遍历effectList，执行DOM操作
  commitMutations(finishedWork.firstEffect);

  // 阶段3：LAYOUT（同步）
  // - 绑定ref
  // - 同步调用useLayoutEffect
  // - 调用componentDidMount/componentDidUpdate
  layout(finishedWork);

  // 阶段4：PASSIVE（异步，commit后调度）
  // - 异步调度useEffect执行
  flushPassiveEffects();

  // 收尾：切换current和workInProgress
  root.current = finishedWork;
}
```

**三个队列的处理：**

| 队列               | 内容                                    | 遍历方式       | 执行时机           |
| ------------------ | --------------------------------------- | -------------- | ------------------ |
| **effectList**     | 有DOM操作的节点（UPDATE/INSERT/DELETE） | nextEffect链表 | mutation阶段       |
| **layoutEffects**  | useLayoutEffect回调                     | 数组遍历       | layout阶段（同步） |
| **passiveEffects** | useEffect回调                           | 数组遍历       | commit后（异步）   |

**mutation阶段的处理：**

```javascript
function commitMutations(effectList) {
  while (effect) {
    switch (effect.flags) {
      case PLACEMENT:
        // 插入DOM
        insertDOM(effect);
        break;
      case UPDATE:
        // 更新DOM属性/文本
        updateDOM(effect);
        break;
      case DELETION:
        // 删除DOM
        removeDOM(effect);
        break;
    }
    effect = effect.nextEffect;
  }
}
```

---

## 六、EffectList的收集

### 为什么要收集effectList？

如果每次commit阶段都遍历整棵树去找有DOM变更的节点，开销太大。effectList收集了**所有需要DOM操作的节点**，commit阶段只需遍历这个链表。

**⚠️ 注意区分三个不同的"effect"概念：**

| 概念               | 内容                                                | 处理时机           |
| ------------------ | --------------------------------------------------- | ------------------ |
| **effectList**     | 有DOM操作的节点（flags: PLACEMENT/UPDATE/DELETION） | mutation阶段       |
| **layoutEffects**  | useLayoutEffect回调                                 | layout阶段（同步） |
| **passiveEffects** | useEffect回调                                       | commit后异步调度   |

### 收集effectList的流程

```
ul的Fiber结构：
    ul
   /  \
 li1  li2
(UPDATE)(INSERT)

遍历顺序：ul → li1 → li1.completeWork → li2 → li2.completeWork → ul.completeWork

1. li1.completeWork: li1的effect挂载到ul
   ul.firstEffect = li1, ul.lastEffect = li1

2. li2.completeWork: li2的effect挂载到ul
   ul.lastEffect.nextEffect = li2
   ul.lastEffect = li2

3. ul.completeWork: ul的effectList挂载到父节点
   parent.firstEffect = ul
   parent.lastEffect = ul

最终ul的effectList:
ul.firstEffect ──► li1 ──► li2 ──► null
            (UPDATE)  (INSERT)

关键：每个节点完成时，把自己的effect挂载到父节点
     父节点完成时，effectList再向上传递，最终汇聚到根节点
```

### 代码实现

```javascript
function completeUnitOfWork(workInProgress) {
  let current = workInProgress.alternate;
  let next = workInProgress.firstEffect;

  // 1. 将当前节点的副作用加入链表
  if (workInProgress.flags) {
    if (workInProgress.return.firstEffect === null) {
      workInProgress.return.firstEffect = workInProgress;
    } else {
      workInProgress.return.lastEffect.nextEffect = workInProgress;
    }
    workInProgress.return.lastEffect = workInProgress;
  }

  // 2. 向上回溯，收集所有子节点的副作用
  let returnFiber = workInProgress.return;
  while (returnFiber) {
    if (returnFiber.firstEffect === null) {
      returnFiber.firstEffect = workInProgress.firstEffect;
    }
    if (workInProgress.lastEffect) {
      if (returnFiber.lastEffect) {
        /// 将父节点的lastEffect的next 指向 当前节点的firstEffect
        returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
      }
      // 更新将父节点的lastEffect，变更成当前节点lastEffect，完成汇聚
      returnFiber.lastEffect = workInProgress.lastEffect;
    }
    returnFiber = returnFiber.return;
  }
}
```

---

## 七、更新触发的完整流程

### 三种触发方式

| 触发方式        | 代码示例                         | 优先级   |
| --------------- | -------------------------------- | -------- |
| setState        | `this.setState({ value })`       | SyncLane |
| useState        | `setValue(newValue)`             | SyncLane |
| ReactDOM.render | `ReactDOM.render(<App />, root)` | SyncLane |

### 完整流程图

```
用户调用setState()
        │
        ▼
┌─────────────────────────────────────────┐
│         enqueueSetState                 │
│  - 创建Update对象                       │
│  - 放入updateQueue                     │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│         scheduleUpdateOnFiber           │
│  - 标记fiber的lanes                     │
│  - 检查是否需要调度                     │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│       ensureRootIsScheduled             │
│  - 获取最高优先级lane                   │
│  - 调用performSyncWorkOnRoot            │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│         performSyncWorkOnRoot           │
│  Render阶段：                           │
│  - beginWork：Diff算法 + 收集useLayoutEffect/useEffect        │
│  - completeWork：收集effectList（DOM操作）        │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│           commitRoot                    │
│  Commit阶段：                           │
│  - beforeMutation                      │
│  - mutation（遍历effectList，执行DOM）   │
│  - layout（useLayoutEffect同步执行）     │
│  - passive（useEffect异步调度）          │
└─────────────────────────────────────────┘
        │
        ▼
        浏览器渲染
```

---

## 八、总结

### Fiber的核心价值

| 特性           | 解决的问题                           |
| -------------- | ------------------------------------ |
| **可中断**     | 避免长时间占用主线程，保持页面响应   |
| **时间切片**   | 将大任务拆分为小任务，每16ms休息一次 |
| **双树机制**   | 内存中构建新UI，不影响屏幕显示       |
| **优先级**     | 高优先级任务可以插队                 |
| **effectList** | 只遍历有DOM变更的节点，避免全量遍历  |

### 区分三个"effect"概念

| 概念               | 收集阶段     | 内容                                    | commit处理         |
| ------------------ | ------------ | --------------------------------------- | ------------------ |
| **effectList**     | completeWork | 有DOM变更的节点（UPDATE/INSERT/DELETE） | mutation阶段       |
| **layoutEffects**  | beginWork    | useLayoutEffect回调                     | layout阶段（同步） |
| **passiveEffects** | beginWork    | useEffect回调                           | commit后（异步）   |

## 参考资料

- [React官方文档：Fiber架构](https://github.com/acdlite/react-fiber-architecture)
- [React源码解读：Fiber](https://github.com/facebook/react/tree/main/packages/react-reconciler)
- [Deep Dive into React Fiber](https://medium.com/react-in-depth)
