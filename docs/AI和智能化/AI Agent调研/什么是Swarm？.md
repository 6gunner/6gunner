## **swarm framework （核心）**

通过swarm router + swarm matcher => 使用哪些Agent来进行工作；

怎么知道我的task用哪个agent最合适？



有一个关键的概念：**“task转换成vector”**，然后根据vector的分数进行排序，选择最合适的。



## Swarm的Agent有哪些协作方式？



### **SequentialWorkflow 按序列进行**

适合串行的任务，有明确的依赖关系的；



### ConcurrentWorkflow 并行



### MixtureOfAgents （组合 —— 先并行，再聚合）

1. 组合不同的agent来完成任务
2. 使用聚合器 agent 来汇总和分析其他 agents 的输出
3. 涉及到一个分解任务，再整合任务的概念

### AgentRearrange 自定义顺序

