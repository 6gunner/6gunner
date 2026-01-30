---
title: Polyhedra Web 项目依赖分析
description: 使用 depcheck 分析项目依赖，发现未使用的依赖
slug: polyhedra-dep-analysis
tags: [dependencies, npm, optimization]
authors: [keyang]
hide_table_of_contents: false
---

使用 depcheck 工具分析项目依赖，发现并清理未使用的 npm 依赖

<!-- truncate -->

# 项目依赖分析

## depcheck

```shell
npm install -g depcheck
```

或者直接运行

```
npx depcheck
```

没安装会提示你安装

然后分析结果：

![image-20240716111005681](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2024/07-16/image-20240716111005681.png)

