---
sidebar_position: 2
---

## 一、为什么需要Diff算法？

在React中，每次状态更新都会产生新的虚拟DOM树。如果直接用新树完全替换旧树，性能开销会非常巨大。

**举个直观例子：**

```
一个1000个节点的列表，如果每次更新都全量替换：
- 需要销毁1000个DOM
- 需要创建1000个DOM
- 总共2000次DOM操作

如果用Diff算法只更新变化的节点：
- 可能只需要移动几个节点的位置
- 最多几十次DOM操作
```

这就是Diff算法存在的意义：**找出新旧DOM树的差异，只更新真正需要变化的部分**。

### 核心概念：Reconciliation

React的更新过程分为两个阶段：

- **Render阶段**：执行组件渲染，生成新的虚拟DOM
- **Commit阶段**：将变化应用到真实DOM

在Render阶段中，有一个核心机制叫**Reconciliation（协调）**，它负责三件事：

1. **找出需要更新的组件** - 哪些组件的props或state变了？
2. **确定更新方式** - 是增加、删除、还是移动节点？
3. **处理挂载和卸载** - 哪些组件需要创建？哪些需要销毁？

而**Diff算法**，就是Reconciliation中负责**对比新旧DOM树**的核心逻辑。

---

## 二、Diff算法的两个核心假设

如果使用传统的树比较算法，时间复杂度是 **O(n³)**——这意味着1000个节点需要比较10亿次，显然不可接受。

React基于两个关键假设，将复杂度优化到接近 **O(n)**：

| 假设         | 含义                                   | 带来的优化                         |
| ------------ | -------------------------------------- | ---------------------------------- |
| **同级比较** | 不同层级的节点不考虑复用               | 只比较同一层级的节点，范围大大缩小 |
| **类型判断** | 同层级的两个组件类型不同，直接销毁重建 | 不需要深入比较内部结构             |

**举个例子理解这两个假设：**

```
DOM结构：
<div>
  <ul>
    <li>A</li>
    <li>B</li>
  </ul>
</div>

变成：

<div>
  <ol>
    <li>A</li>
    <li>B</li>
  </ol>
</div>

根据假设1（同级比较）：
- div → div：同一层级，类型相同，可能复用
- ul → ol：同一层级，类型不同，直接销毁ul和其子节点，重新创建ol

即使ul和ol里面都是A和B两个li，React也不会去比较它们，
因为父节点类型已经变了，子节点都要重建。
```

**⚠️ 这就是为什么要谨慎使用Fragments：**

```jsx
// parent从<div>变成<Fragment>，内部所有子节点都会重建
return condition ? <div>{children}</div> : <Fragment>{children}</Fragment>;
```

---

## 三、Diff算法的实现原理

### 单节点Diff

当只有一个子节点时，React通过**key和type**来判断是否可复用：

```javascript
// 判断逻辑简化版
function reconcileSingleElement(returnFiber, newChild) {
  const isSameType = oldChild.type === newChild.type;
  const isSameKey = oldChild.key === newChild.key;

  if (isSameType && isSameKey) {
    // ✅ 类型和key都相同，完全复用
    return { effect: 'UPDATE', node: oldChild };
  } else {
    // ❌ 类型或key不同，销毁旧节点，创建新节点
    return { effect: 'REPLACE', oldNode: oldChild, newNode: newChild };
  }
}
```

### 多节点Diff的完整流程

当同一个层级下有多个子元素时，React采用"**自左向右遍历新节点，在旧节点中查找匹配项**"的策略。整个过程会产生**移动、销毁、新建**三种操作。

#### 核心判断逻辑

我们用两个变量来追踪节点是否需要移动：

- `oldIdx`：当前新节点在旧链表中的位置
- `maxOldIdx`：已处理新节点在旧链表中出现的**最大位置**

**判断规则：**

| 条件                 | 含义                             | 操作                                         |
| -------------------- | -------------------------------- | -------------------------------------------- |
| `oldIdx > maxOldIdx` | 这个旧节点在之前所有新节点的右边 | ✅ **无需移动**，更新 `maxOldIdx = oldIdx`   |
| `oldIdx < maxOldIdx` | 这个旧节点在某个新节点的左边     | ⚠️ **需要移动**，将DOM移到当前 `newIdx` 位置 |
| 旧链表中不存在       | 没有可复用的节点                 | 🆕 **新建DOM**，插入到当前 `newIdx` 位置     |

#### 流程图解

以 `old: [A, B, C, D]` → `new: [B, A, D, C]` 为例：

```
初始状态: maxOldIdx = -1

处理 B: oldIdx=1 > maxOldIdx=-1 → 不需要移动，更新 maxOldIdx=1
处理 A: oldIdx=0 < maxOldIdx=1  → 需要移动到位置1
处理 D: oldIdx=3 > maxOldIdx=1  → 不需要移动，更新 maxOldIdx=3
处理 C: oldIdx=2 < maxOldIdx=3  → 需要移动到位置3

最终: 删除旧链表中未被访问的节点
```

#### 代码示例

```javascript
// 简化版Diff逻辑演示
function diffChildren(newChildren, oldChildren) {
  let maxOldIdx = -1;
  const result = [];

  newChildren.forEach((newChild, newIdx) => {
    // 1. 在旧节点中查找相同key的节点
    const match = oldChildren.find((old) => old.key === newChild.key);

    if (match) {
      // 2. 找到匹配节点，判断是否需要移动
      const oldIdx = oldChildren.indexOf(match);

      if (oldIdx > maxOldIdx) {
        // 位置在右边，不需要移动
        maxOldIdx = oldIdx;
        result.push({ type: 'UPDATE', node: match });
      } else {
        // 位置在左边，需要移动到当前位置
        result.push({ type: 'MOVE', node: match, toIndex: newIdx });
      }
    } else {
      // 3. 没找到匹配，需要新建
      result.push({ type: 'INSERT', node: newChild, toIndex: newIdx });
    }
  });

  // 4. 清理未被访问的旧节点（删除操作）
  oldChildren.forEach((old) => {
    if (!newChildren.find((n) => n.key === old.key)) {
      result.push({ type: 'DELETE', node: old });
    }
  });

  return result;
}
```

#### 关键结论

- **maxOldIdx 只会增大，不会减小**：因为我们总是从左到右遍历，新节点在旧链表中出现的位置只会越来越靠后
- **移动的本质**：当发现某个节点需要移动时，React会将该节点从原位置"拔出来"，插入到新位置
- **删除时机**：所有新节点处理完后，再统一删除旧链表中未被复用的节点

---

## 四、为什么不能用Index作为Key？

Key是React用来判断组件是否可复用的**核心依据**。使用不当会导致严重的性能问题和状态错位。

### 场景1：性能问题

```jsx
// ❌ 使用Index作为Key
const List = ({ items }) => (
  <ul>
    {items.map((item, index) => (
      <ListItem key={index} item={item} />
    ))}
  </ul>
);
```

**问题演示：**

```
初始: items = [A, B, C, D]    key = [0, 1, 2, 3]
头部插入X后: items = [X, A, B, C, D]  key = [0, 1, 2, 3, 4]

虽然数据是[X, A, B, C, D]，但React认为：
- key=0的组件从A变成了X（props变了）
- key=1的组件从B变成了A（props变了）
- 所有组件的props都变了，全部需要重新渲染

实际上只需要新增一个X组件，其他都可以复用！
```

### 场景2：状态错位（更严重）

当列表项包含**不受控组件**（如input）时，Index作为Key会导致状态错位：

```jsx
import { useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习React' },
    { id: 2, text: '学习Vue' },
  ]);

  const reverseTodos = () => {
    setTodos([...todos].reverse());
  };

  return (
    <div>
      <button onClick={reverseTodos}>反转待办事项</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            <label>{todo.text}</label>
            <input placeholder={`todo ${index}`} />
            {/* 用户的输入会"错位" */}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**问题演示：**

```
初始: [学习React, 学习Vue]
用户在input里输入的是: ["张三", "李四"]

顺序颠倒后: [学习Vue, 学习React]
界面在input里展示的还是: ["张三", "李四"]，张三的任务变了“学习Vue"，李四的任务变成了“学习React“
用户的输入内容跟着组件"移动"了，而没有跟着数据！

React认为：
- key=0的组件还是同一个（input被复用了）
- key=1的组件还是同一个

但实际上：
- 学习vue的任务应该是"李四"做的，而react的任务应该是张三去做。


```

### ✅ 正确做法：使用唯一ID

```jsx
// ✅ 使用唯一ID作为Key
const List = ({ items }) => (
  <ul>
    {items.map((item) => (
      <ListItem key={item.id} item={item} />
    ))}
  </ul>
);
```

这样无论列表如何变化，只要数据项的ID不变，React就能正确地复用组件和DOM。

---

## 五、延伸思考

假如我通过某种手段（比如Random Key）强制让 React **全量销毁重建**呢，开销对比怎么样：

| 方案           | 操作类型        | 具体开销                   | 推荐程度          |
| -------------- | --------------- | -------------------------- | ----------------- |
| **唯一ID**     | DOM移动         | 1次操作                    | ✅ **最佳**       |
| **Index**      | 属性更新/重渲染 | N次Render + N次DOM修改     | ⚠️ **有条件使用** |
| **Random Key** | 销毁+挂载       | 2N次生命周期 + 2N次DOM操作 | ❌ **避免使用**   |

**详细对比（以100个节点的列表为例）：**

| 方案       | 渲染次数           | DOM操作         | 生命周期 | 初始化逻辑 |
| ---------- | ------------------ | --------------- | -------- | ---------- |
| 唯一ID     | 0次（复用）        | 移动几次        | 0次      | 0次        |
| Index      | 100次（props变化） | 修改属性100次   | 0次      | 0次        |
| Random Key | 100次（全量重建）  | 销毁100+创建100 | 100次    | 100次      |

**结论：**

- 唯一ID：性能最佳，状态正确
- Index：在**列表顺序固定**的情况下可以用，但顺序变化时会有性能问题和状态风险
- Random Key：开销最大，应该避免。所以我们要避免这么去做，情愿用index作为key也不要这么做

---

## 六、总结

### Diff算法的核心要点

1. **同级比较**：只比较同一层级的节点
2. **类型判断**：类型不同则销毁重建
3. **Key的作用**：通过唯一ID让React正确识别"同一个"节点
4. **移动判断**：用`oldIdx`和`maxOldIdx`判断节点是否需要移动

### 最佳实践

```jsx
// ✅ 正确示范
{todos.map(todo => (
  <TodoItem key={todo.id} {...todo} />  // 使用稳定唯一ID
))}

// ✅ 列表顺序固定时可以使用Index
<div>{Array.from({ length: 5 }).map((_, index) => (
  <FixedItem key={index} />  // 顺序永远不会变
))}

// ❌ 错误示范
{todos.map((todo, index) => (
  <TodoItem key={index} {...todo} />  // 顺序变化时会出问题
))}
```

### 参考资料

- [React官方文档：协调](https://reactjs.org/docs/reconciliation.html)
- [React Diff算法详解](https://zhuanlan.zhihu.com/p/20346379)
