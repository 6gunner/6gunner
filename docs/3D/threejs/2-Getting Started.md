## 3d坐标系：

threejs默认右手坐标系，z轴指向屏幕外。
右手比较变扭，左手大拇指指向x，食指指向y，会发现中指指向屏幕里。
又因为右手和左手是对称的，所以右手中指会指向屏幕外

## eg1. 用three.js创建一个立方体cube

需求：创建一个立方体，然后控制上下左右的旋转
总结：有哪些重要的知识点

代码位置：

### 1.1 threejs渲染需要哪些元素？

#### a、Scene 场景

一个舞台，所有需要渲染的3d对象都要先添加到舞台上；

```tsx
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.add(cube);
```

#### b、Renderer 渲染器

renderer用来渲染内容，复制将3d场景转化成2d图像，最后通过dom添加到html里

```tsx
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
renderer.render(scene, camera); // 渲染场景

document.getElementById('app')?.appendChild(renderer.domElement);
```

#### c、Camera 相机

相机分为透视相机，正交相机

**透视Camera**

```tsx
import * as THREE from 'three';

const camera = new THREE.PerspectiveCamera(
  100, // fov 镜面的角度
  window.innerWidth / window.innerHeight, // aspect 宽高比
  0.1, // 近剪裁面
  100 // 远剪裁面
);
```

#### d、Mesh 网格

mesh理解成我们最终要渲染的对象。
3d对象都是由Material + Geometry组合起来的，mesh的作用就是将几何图形和材质组合在一起，
形成对象。

```tsx
import * as THREE from 'three';

const mesh = new THREE.Mesh(cube, material); // 组合几何体和材质
scene.add(mesh); // 将网格添加到场景中
```

#### e、light 光线

光线会影响到一些3d对象的阴影渲染。
分：平行光线（DirectionalLight） + 点光线（PointLight）

### 1.2 OrbitController

OrbitControls 是 Three.js 中一个非常实用的相机控制器，它允许用户通过鼠标或触摸来交互式地控制场景的视角。

**基本用法：**

```tsx
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// threejs默认右手坐标系，z轴指向屏幕外

// camera默认方向是负轴
// fov 角度
// aspect 宽高比
// near 近裁剪面
// far 远裁剪面
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  5,
  100
);
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // 添加黑色背景

// 添加cube
const cube = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(cube, material);
scene.add(mesh);

renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 10); // 将相机放在立方体前方
controls.update();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

document.getElementById('app')?.appendChild(renderer.domElement);

animate();
```

主要功能包括：

轨道旋转：用鼠标左键点击并拖动，可以围绕物体进行轨道式旋转

平移：用鼠标右键点击并拖动（或按住 Ctrl/Meta + 左键拖动），可以平移视角

缩放：使用鼠标滚轮可以进行缩放

### 1.3 AxesHelper

坐标轴：

```tsx
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
```

红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴.

<img src="https://ipic-coda.oss-cn-beijing.aliyuncs.com/2025/01-15/image-20250115223959909.png" alt="image-20250115223959909" style={{ zoom: '50%' }} />

## eg2. 利用threejs画线

画线需要到的material和gemotry创建方式不一样

```tsx
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Line {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  constructor(container: HTMLElement) {
    // 初始化场景
    this.scene = new THREE.Scene();

    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      5,
      100
    );

    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000);
    container.appendChild(this.renderer.domElement);

    // 创建lines
    // const geometry = new THREE.BufferGeometry();
    // const positions = new Float32Array([
    //   0, 0, 0,
    //   1, 0, 0,
    //   0, 1, 0,
    //   0, 0, 1
    // ]);
    // geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const points = [];
    points.push(new THREE.Vector3(0, 0, 1));
    points.push(new THREE.Vector3(0, 1, 0));
    points.push(new THREE.Vector3(1, 0, 0));
    points.push(new THREE.Vector3(0, 0, 1));
    // 三角形
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    // 设置控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.set(0, 0, 10);
    this.controls.update();

    // 添加坐标轴辅助
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // 开始动画循环
    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // 清理方法
  public dispose() {
    this.renderer.dispose();
    this.controls.dispose();
  }
}
```

**ps：画三角形需要4个点（ 两点一线，最后首尾要重复）**

## Geometry的分类

### TorusGeometry

**圆环几何体**

构造函数：

- 圆环半径
- 横截面的半径
- 横截面的分段数
- 圆环的分段数

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-05-30/image-20250530164617439.png" alt="image-20250530164617439" style={{ zoom: '50%' }} />

```tsx
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);
```

## 三、纹理

## 三、加载3d models

我们加载glTF的工具
