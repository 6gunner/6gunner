---
title: AI Agent 是什么 - 全面解析人工智能代理
description: 从 5W1H 角度拆解 AI Agent，分析其定义、能力边界、实现方式，以及为什么它是 LLM 的重要扩展
slug: ai-agent-explained
sidebar_position: 0
tags: [AI, Agent, LLM, 人工智能, 机器学习]
keywords: [AI Agent, 人工智能代理, LLM, 自主代理, AI 助手]
---

> 本文还是尝试从 5W1H 的角度 ("What", "Why", "How" 等) 来对 AI Agent 进行拆解和分析。

最近阅读了大量 AI Agent 相关的资料，做了一些记录

## 1. 它是什么？能帮我做什么？

它是一个基于LLM扩展出来的AI助理。

可以帮我们完成一些复杂的任务，比如

- 自动回复推文 (Auto-reply tweet)；
- 自动搜集新闻、分析新闻要点；
- 自动盯盘，完成金融交易；
  ...

## 2. 为什么需要AI Agent？

现有的 LLM（如 ChatGPT、Claude）主要局限于文本对话（Chat），无法直接帮我们**做事情**（Action），AI Agent 的出现就是为了能弥补这块短板。

## 3. 怎么去实现一个 AI Agent？

### 3.1 通俗类比

如果把 Agent 比作一个人，它需要的构造如下：

- **大脑 (AI Model)**：负责思考、决策。
- **记忆 (Memory)**：存储上下文和历史信息。
- **手脚 (Skills / Tools)**：与外界交互的能力。

### 3.2 技术架构

从技术实现角度，一个标准的 Agent 通常包含以下四个组件：

1.  **决策分析层 (Planning)**
    - 利用思维链 (Chain of Thought) 等技术进行任务拆解和规划。
2.  **记忆层 (Memory)**
    - **短期记忆**：当前的上下文。
    - **长期记忆**：向量数据库等持久化存储。
3.  **工具使用 (Tools & Skills)**
    - 通过定义好的 Tools 和 Skills，Agent 知道自己具备哪些改变环境的能力。
    - **MCP Server**：可以理解为第三方提供的一套标准的、有针对性的服务接口。Agent 可以连接 MCP Server 来扩展能力（例如获取实时天气、当前时间、动态新闻等）。
4.  **执行层 (Action)**
    - 执行具体的代码或 API 调用，真正地去改变外界状态。

## 4 学习资源与参考项目

目前已经有很多成熟的 AI Agent 项目，我们可以站在巨人的肩膀上，基于现有的 Framework 进行二次开发。

**推荐学习的代码库：**

- **Eliza**: 如果想从零了解什么是 AI Agent 及其实现框架，强烈建议阅读 [Eliza](./项目解读-ElizaOS.mdx) 的代码。
- **Clawdbot**:
