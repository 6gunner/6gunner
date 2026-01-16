
**HIR** - 高级中间表示。怎么理解？

**全称：**High-level Intermediate Representation

**优点：**便于分析、优化、转换顺序。

分析：依赖项的分析
优化：自动加一下memo，cache等
转换顺序：重新排列、合并一些代码块操作

HIR后缀的pass，都在这个阶段进行处理

FlattenScopesWithHooksOrUseHIR： 在HIR阶段flatten hooks的scopes
BuildReactiveScopeTerminalsHIR： 