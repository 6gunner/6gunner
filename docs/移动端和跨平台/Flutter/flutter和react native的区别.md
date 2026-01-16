
技术实现上：

flutter底层的渲染是自己去实现的

react native的渲染是交给android或ios来实现的，通过json bridge来进行通信，效率低；



具体分析：

Flutter：

渲染流程：
```
Dart

Render Object

Layer Tree

Skia Engine

GPU Canvas

屏幕展示
```


Flutter本质上，就抛开了Object-C，Java实现的这些UIKit，直接用自己的渲染引擎，然后调用GPU API，绘制Canvas了。

### 原生组件的路径：

```
开发者代码
    ↓
UIButton/TextView (高级抽象)
    ↓  
CALayer/Canvas (系统图形层)
    ↓
Core Animation/Skia (系统渲染引擎)
    ↓
Metal/OpenGL (GPU API)
    ↓
GPU Canvas
```

### Flutter 的路径：

```
开发者代码
    ↓
Flutter Widget (高级抽象)
    ↓
Flutter Engine (自带渲染引擎)
    ↓
Skia (自带图形库)
    ↓
Metal/OpenGL (GPU API)
    ↓
GPU Canvas
```

```
```


React native的三个独立线程：

```
js 线程
Shadow 线程
原生主线程
```

渲染流程：

- js线程负责将虚拟dom，通过bridge桥，将信息发送给shadow线程
- shadow线程接收到信息，用Yoga布局引擎计算组件的位置（tag，width，height，position等等）
- shadow线程和原生主线程之间进行通信，创建对应的原生组件。下面有一个组件关系表格参考：

| React Native 组件 | iOS 原生组件     | Android 原生组件 |
| --------------- | ------------ | ------------ |
| `<View>`        | UIView       | ViewGroup    |
| `<Text>`        | UILabel      | TextView     |
| `<ScrollView>`  | UIScrollView | ScrollView   |
| `<TextInput>`   | UITextField  | EditText     |


React Native的性能瓶颈：
- 因为js线程和shadow线程之间，需要通过json序列化的形式传递。
- Bridge其实是一个异步消息队列，异步通信可能导致多帧延迟
- ui更新频繁，bridge会成为瓶颈；

新的fabric架构对此进行了优化：
```
JavaScript ←→ C++ (JSI) ←→ 原生组件
         直接调用      直接调用
```
js直接调用c++方法，替代了Bridge，减少了通信。



## 性能比较

理论上：React Native不可能性能比Flutter要高，因为Flutter的路径更短；

Flutter: Dart → Engine → GPU (直接路径)
React Native: JS → Bridge → 原生组件 → GPU (间接路径)

根据各种基准测试，现实比理论复杂：


**启动速度上：**

React Native: ~800ms (需要启动 JS 引擎)
Flutter: ~400ms (AOT 编译的机器码直接运行)

**内存使用上：**

**React Native:**

```
JS 引擎内存 + 原生组件内存 = 相对较少
```

**Flutter:**

```
Dart 运行时 + Skia 引擎 + 渲染缓存 = 相对较多
```

Flutter 应用通常内存占用更大。


**编译时机的对比：**


（JavaScript in React Native）

```
编写代码 → 打包 → 安装到手机 → 运行时解释执行
                                    ↑
                                 每次都要解释
```

Flutter Release 模式

```
编写代码 → 编译成机器码 → 打包 → 安装到手机 → 直接执行机器码
            ↑                                    ↑
        编译一次                            直接跑，超快
```

这些机器码可以直接被 CPU 执行，无需任何解释或编译步骤。

现在React Native引入了Hermes 引擎，会将js进行aot编译，成为字节码，节省了点时间。

## 所以准确的对比是：

### React Native (传统)：

```
JS 源码 → 打包压缩 → 仍是 JS → 运行时解释执行
```

### React Native (Hermes)：

```
JS 源码 → 编译成字节码 → 运行时执行字节码 (更快)
```

### Flutter：

```
Dart 源码 → AOT 编译 → 机器码 → 运行时直接执行
```