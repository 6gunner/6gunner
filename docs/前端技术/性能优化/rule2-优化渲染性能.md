### 刷新率：

每一个设备有自己的刷新率，除非一些高刷手机，大部分设备的刷新率是`60帧/1s`





### **弄明白一帧里做了什么事情？**

虽然一帧有16.6ms，但是程序最好在10ms内处理好逻辑。

**浏览器主线程在一帧里大致流程如下：**

处理用户交互 

处理requestAnimationFrame的回调

解析html => 收集css => 重新计算layout 位置 => 更新dom树

绘制、填充像素 

**合成**：composer thread将各个图层按正确的顺序组合、叠加到一起，然后去处理transparent、transform等视觉效果，最后生成最终要展示在屏幕上的pixels。如果将我们的动画属性，只会影响Composite阶段，就会使得动画很流畅。因为避免了不必要的layout计算；



![anatomy-of-a-frame](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-03-14/anatomy-of-a-frame.svg)



### 几个重要Thread

**Compositor Thread**： 理解成大boss，Main Thread的work实际上是由他来发起的。

主要作用：

- 接收vsync event, 创建新的frame
- 接收用户的input event
- 会尽量避免调用Main Thread，除非是需要复杂计算的，才会唤醒Main Thread.
- 能直接调用gpu thread来更新渲染内容



Main Thread:  主要处理一些用户的input event





### 优化的思路：

可以理解成，优化就是让一帧里面做的事情尽可能的少。从而减少Compositor Thread需要处理的时间



https://aerotwist.com/blog/the-anatomy-of-a-frame/







