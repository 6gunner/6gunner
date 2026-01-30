---
title: SVG 和 PNG 的渲染理论区别
description: 分析 SVG 和 PNG 在浏览器中的渲染流程和性能差异
slug: svg-png-rendering
tags: [svg, png, rendering, performance]
authors: [keyang]
hide_table_of_contents: false
---

本文深入分析 SVG 和 PNG 两种图片格式在浏览器中的渲染流程差异，包括 CPU 计算、GPU 纹理处理等方面的性能对比

<!-- truncate -->

### 渲染流程对比

#### SVG渲染流程:

1. 解析XML结构
2. CPU计算路径
3. 生成位图
4. 上传GPU
5. 最终渲染

#### PNG渲染流程:

6. 加载位图数据
7. 直接上传GPU
8. 纹理渲染

GPU渲染原理：

- PNG等位图可以直接作为纹理上传到GPU
- GPU对于纹理渲染有专门的硬件加速
- 渲染过程简单：纹理采样 → 光栅化 → 显示
- 不需要CPU参与复杂计算

10. SVG的渲染流程：

- 浏览器需要先解析SVG的XML结构
- CPU需要计算每个路径和图形的几何形状
- 将计算结果转换为位图
- 最后才能交给GPU渲染
- 大量的路径计算会占用CPU资源

