---
sidebar_position: 3
---

## 什么是 Swarm？

Swarm可以理解成多个agent协作的架构

在 Swarm 中，不同的 Agent 根据各自特点进行分工，完成自己的任务后再移交给下一个 Agent 继续工作。**Agent 之间的协作方式和任务分配**是这种架构的核心。

## Swarm 的核心优势

| 优势         | 说明                                                      |
| ------------ | --------------------------------------------------------- |
| **任务拆解** | 一个 Agent 专门查资料，一个专门写代码，一个专门做合规检查 |
| **降低成本** | 简单任务派给小模型（如 GPT-4o-mini），复杂逻辑才用大模型  |
| **并行处理** | 多个 Agent 可以同时开工，不用在一个长对话里排队           |
| **专业分工** | 每个 Agent 专注于特定领域，提高准确性                     |

---

## Swarm Framework 核心机制

### 路由与匹配

```
User Task → Swarm Router → Swarm Matcher → 选择合适的 Agent(s)
```

**核心问题**：如何知道一个 Task 应该用哪个 Agent 最合适？

**解决方案**：**Task 向量化匹配**

1. 将 Task 描述转换成向量（Embedding）
2. 将每个 Agent 的能力描述也转换成向量
3. 计算相似度分数，选择最匹配的 Agent

```python
# 伪代码示意
task_vector = embed(task_description)
agent_scores = [(agent, similarity(task_vector, agent.capability_vector))
                for agent in agents]
selected_agents = sorted(agent_scores, key=lambda x: x[1], reverse=True)[:k]
```

---

## Agent 协作模式

Swarm 提供了多种 Agent 协作方式，适用于不同场景：

### 1. SequentialWorkflow（顺序执行）

适用于**串行任务**，有明确的依赖关系。

```
Agent A → Agent B → Agent C → 最终结果
```

**示例**：代码生成流程

```
需求分析 Agent → 代码编写 Agent → 代码审查 Agent → 测试 Agent
```

### 2. ConcurrentWorkflow（并行执行）

适用于**独立任务**，可同时进行。

```
        ┌→ Agent A ─┐
Task ───┼→ Agent B ─┼─→ 汇总结果
        └→ Agent C ─┘
```

**示例**：多维度分析

```
        ┌→ 技术分析 Agent ─┐
报告 ───┼→ 财务分析 Agent ─┼─→ 综合报告
        └→ 风险分析 Agent ─┘
```

### 3. MixtureOfAgents（混合模式）

**先并行，再聚合**。结合了并行处理和结果整合。

```
        ┌→ Agent A ─┐
Task ───┼→ Agent B ─┼─→ Aggregator Agent → 最终结果
        └→ Agent C ─┘
```

**特点**：

- 组合不同 Agent 并行完成子任务
- 使用**聚合器 Agent** 汇总和分析其他 Agent 的输出
- 涉及任务分解与结果整合

**示例**：论文写作

```
        ┌→ 文献综述 Agent ─┐
主题 ───┼→ 数据分析 Agent ─┼─→ 写作整合 Agent → 完整论文
        └→ 方法论 Agent ───┘
```

### 4. AgentRearrange（自定义顺序）

支持**自定义 DAG（有向无环图）**编排，灵活定义 Agent 之间的依赖关系。

```python
# 示例：自定义复杂流程
workflow = AgentRearrange(
    flow="A -> B, A -> C, B -> D, C -> D"
)
```

---

## 协作模式对比

| 模式            | 执行方式    | 适用场景           | 复杂度 |
| --------------- | ----------- | ------------------ | ------ |
| Sequential      | 串行        | 有依赖的流水线任务 | 低     |
| Concurrent      | 并行        | 独立的多维度任务   | 中     |
| MixtureOfAgents | 并行 + 聚合 | 需要综合多方结果   | 中     |
| AgentRearrange  | 自定义 DAG  | 复杂依赖关系       | 高     |

---

## 相关项目

- [OpenAI Swarm](https://github.com/openai/swarm) - OpenAI 官方的多 Agent 协作框架（实验性）
- [AutoGen](https://github.com/microsoft/autogen) - 微软的多 Agent 对话框架
- [CrewAI](https://github.com/joaomdmoura/crewAI) - 基于角色的 Agent 协作框架
