---
sidebar_position: 0
---

# 如何理解react的两个阶段

## 一、概述

React 的更新过程分为两个主要阶段：

```
状态更新 → Render 阶段 → Commit 阶段 → 视图更新
```

- **Render 阶段**：计算变化，可中断（异步）
- **Commit 阶段**：应用变化，不可中断（同步）

---

## 二、Render 阶段

### 2.1 主要工作

Render 阶段负责计算哪些内容需要更新：

1. 将 JSX 构建成 Fiber Tree
2. 对新旧 Fiber Tree 进行 Diff 对比
3. 为变化的节点打上"副作用标记"（effectTag）

### 2.2 Reconciliation（协调）

Render 阶段的核心是 Reconciliation 算法：

```
Reconciliation = Diffing 算法 + Fiber 架构调度 + 状态更新策略
```

### 2.3 可中断性

- **React 16 之前**：Render 阶段是同步的，不可中断
- **React 16.8 之后**：引入 Fiber 架构，Render 阶段变成可中断的

这意味着在处理低优先级任务时，React 可以暂停工作，优先响应用户交互等高优先级任务。

---

## 三、Commit 阶段

### 3.1 主要工作

Commit 阶段负责将 Render 阶段计算出的变化应用到真实 DOM：

- 根据标记过的 Fiber 节点，对 DOM 进行增删改
- **不可中断**：Commit 阶段是原子性的，否则用户会看到不一致的 UI

### 3.2 三个子阶段

Commit 阶段细分为三个小阶段：

1. **Before Mutation 阶段**
   - 发生在 DOM 操作之前
   - 读取变更前的 DOM 状态（如 `getSnapshotBeforeUpdate`）
   - 调度 `useEffect` 的异步执行

2. **Mutation 阶段**
   - 对 DOM 进行真正的增删改操作
   - 这是实际修改 DOM 树的阶段

3. **Layout 阶段**
   - 发生在 DOM 操作之后
   - 执行 `useLayoutEffect` 回调
   - 收集 `useEffect` 的回调

---

## 四、完整流程示例

当调用 `setState` 触发状态更新后：

1. **进入调度流程**
   - 在并发模式下，可能会被批处理或中断
   - Scheduler 根据优先级进行任务调度

2. **Render 阶段**（可中断）
   - 构建新的 Fiber Tree
   - Diff 对比，打上 effectTag

3. **Commit 阶段**（不可中断）
   - Before Mutation：准备工作
   - Mutation：更新 DOM
   - Layout：执行同步副作用

4. **异步执行 useEffect**
   - 在下一个事件循环中执行

---

## 五、关键要点总结

- ✅ **Render 阶段可中断**，不会直接操作 DOM，可以被打断重来
- ✅ **Commit 阶段不可中断**，保证 UI 的一致性
- ✅ Fiber 架构使得 React 能够实现**时间切片**和**优先级调度**
