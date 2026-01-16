---
title: 如何学习3D
description: 如何学习3D?
hide_table_of_contents: false
sidebar_position: 0
---

​ 我有一些有前端开发基础，并熟悉JavaScript和TypeScript，学习Three.js和WebGL来开发3D应用或游戏会更轻松。以下是一个快速学习的路线，帮助你从基础到进阶地掌握3D网页开发技能：

### 第一步：打好3D基础

- 学习3D图形学基础

  ：了解3D坐标系、向量、矩阵变换、摄像机、光照等基本概念。
  - 推荐资源：《3D Math Primer for Graphics and Game Developme》或者一些在线教程，帮助理解3D空间、旋转、缩放等基础。

- WebGL基础

  ：你可以通过了解WebGL的基本概念来帮助理解Three.js的底层原理，但不必深入。
  - 推荐教程：Mozilla的[WebGL教程](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial)简单易懂。

### 第二步：学习Three.js基础

- Three.js基础使用

  ：学习Three.js的基础语法，包括创建场景、添加物体（如立方体、球体等）、光源、材质、渲染。
  - 推荐资源：Three.js文档 和 Three.js官方示例，可以帮助理解Three.js的使用方式。
  - **目标**：创建一个简单的3D场景，包含几何体、光源和摄像机，并实现基本的动画效果。

- 学习模块
  - **场景和相机**：理解如何设置视角和场景。
  - **几何体和材质**：掌握如何使用Three.js提供的几何体对象（BoxGeometry、SphereGeometry等），以及材质（MeshBasicMaterial、MeshStandardMaterial等）。
  - **光照和阴影**：学习如何使用光照，并理解阴影效果的实现。
  - **基础动画**：了解Three.js中的动画循环。

### 第三步：创建简单的3D互动项目

- **互动性**：使用鼠标和键盘事件控制摄像机和物体。
- **相机控制**：学习OrbitControls等控件，让用户可以拖动、缩放视角。
- **简单的项目**：尝试制作简单的3D展示项目，比如一个旋转的立方体、互动性模型展示等。

### 第四步：深入Three.js功能

- **加载模型**：学习如何导入和展示3D模型（如.glb、.obj格式）。
- **材质和贴图**：学习使用自定义材质和贴图，增加真实感。
- **粒子系统和特效**：尝试制作粒子效果、光照特效等。
- **物理引擎**：如果计划制作游戏，可以学习Physijs或Cannon.js，为Three.js项目添加物理效果，比如重力、碰撞等。

### 第五步：制作完整的3D网页项目

- **完整项目**：开发一个互动式3D网页应用或小游戏，例如一个迷你3D游戏、产品展示、虚拟场景浏览等。
- **性能优化**：学习一些常用的优化技巧，如减少Draw Call、使用LOD（细节层次）、优化模型等。
- **发布**：将你的项目发布到平台上（如Vercel或GitHub Pages）并进行展示。

### 一些资料

#### 开源项目和教程

**3D Dice Roller**

- **简介**：一个开源的Three.js项目，用于创建交互式3D骰子。可以学习到模型加载、动画控制等知识。
- https://tympanus.net/codrops/2023/01/25/crafting-a-dice-roller-with-three-js-and-cannon-es/
- **适合**：适合了解Three.js的基础功能和动画控制。

**Minecraft Clone in Three.js**

- **简介**：一个使用Three.js开发的Minecraft克隆项目。通过这个项目可以学习如何实现方块渲染、地图生成等功能。
- **链接**：[Minecraft Clone GitHub](https://github.com/Scottapotamas/MineBlock)
- **适合**：适合有前端基础并想挑战复杂项目的开发者。

**Spaceship Game Example**

- **简介**：一个用Three.js制作的太空飞船小游戏示例，展示了模型加载、用户控制和碰撞检测。
- **链接**：[Spaceship Game GitHub](https://github.com/alexnoz/spacegame)
- **适合**：学习互动游戏开发的入门者。

### 一些成品代码研究:

https://github.com/ssusnic/Pseudo-3d-Racer 先看这个

https://github.com/dotgreg/weixin-minigame-tutorial/tree/master?tab=readme-ov-file

https://martindrapeau.github.io/backbone-game-engine/ 有文档

https://github.com/TomWHall/Descensus2?tab=readme-ov-file

https://github.com/FullScreenShenanigans/EightBittr

有视频：https://www.youtube.com/watch?v=-z2Nwz9fPA8

同济大学的案例

https://www.bilibili.com/video/BV1pd4y167BL/?spm_id_from=333.337.search-card.all.click&vd_source=8be73ba4a479fffa6eb34b4689ced1ae

数学基础：

[3d数学](https://github.com/HulkCode0x29A/3DMathPrimer?tab=readme-ov-file)

https://www.gamemath.com/book/
