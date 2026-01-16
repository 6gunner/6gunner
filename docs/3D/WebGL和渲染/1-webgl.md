## 带着问题

0、为啥要了解web gl?

和渲染有关，可以利用gpu来渲染内容

算是在web端最简单直接使用gpu的技术了，适合我这种有js基础的人学；



### 1、什么是web gl?

todo

opengl es??





#### webgl context怎么创建？

就是

```
canvas.getContext('webgl')
```



#### 为啥设置颜色调用的是clear方法？

因为清除比绘制更方便快捷；



#### clear还有哪些api?

clear是为了重置缓冲区。

在WebGL中，gl.clear() 可以接收以下三个参数（位掩码），并且可以通过位运算符 | 组合使用：

- `gl.COLOR_BUFFER_BIT`

**清除颜色缓冲区**

使用 gl.clearColor() 设置的颜色来清除

- `gl.DEPTH_BUFFER_BIT`

**清除深度缓冲区**

使用 gl.clearDepth() 设置的深度值来清除（默认值是1.0）

用于3D渲染中的深度测试

- `gl.STENCIL_BUFFER_BIT`

**清除模板缓冲区**

使用 gl.clearStencil() 设置的值来清除（默认值是0）

用于复杂的遮罩效果





### 2、怎么加内容 - 2d的

shader code: glsl（opengl shading language）

shader是可编程的，需要glsl语言来描述 vertex position-顶点坐标，colors颜色信息



#### 2.1 vertex shader啥作用？

用来确定顶点的坐标，需要进行换算，

##### a、从物体空间转化到世界空间，

```
const modelViewMatrix = mat4.create(); // 创建一个新的 4x4 矩阵，初始化为单位矩阵（identity matrix）
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]); // 将矩阵平移到 z 轴负方向 6 个单位。
  mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation, [0, 0, 1]); // 将矩阵绕 z 轴旋转 squareRotation 弧度
```



**为什么要沿着z轴平移？**

这是因为 WebGL 使用的是右手坐标系，观察者（相机）默认位于原点(0,0,0)看向 -z 方向。

如果不平移，物体会和相机在同一个位置(z=0)，这样会导致：

物体可能太近而看不见

**防止物体被近裁剪面裁剪**：相机前面有一个“近裁剪面”（near plane），位于相机前的一个小距离处。任何位于近裁剪面和相机之间的物体部分或全部都会被裁掉，无法显示。

通过将物体平移到更远的地方，比如 z = -5，可以确保物体在视锥内并完整地呈现在相机视野中。



##### b、再转化到相机平面坐标；

```
  const fieldOfView = 45 * Math.PI / 180; // 视角fov（45in radians）
  const aspect = gl.canvas.width / gl.canvas.height; // 宽高比
  const zNear = 1; // 近平面距离
  const zFar = 2000; // 远平面距离
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
```





#### 什么是fragme shader? 它和vertex shader有什么关系？

用来确定顶点的颜色，然后进行绘制。

vertex和fragment之间传递数据通过 varying 关键字来，varying 存放顶点的颜色

webgl会根据顶点的颜色进行插值计算，然后计算每一个颜色的颜色，交给fragment sharder来绘制；

sharder在每个pixel需要被绘制的时候调用。



### 3、什么是shader？怎么创建？

```
创建sharder: gl.createShader(type);
传递、编译source: gl.shaderSource(shader, source); gl.compileShader(shader)

```



#### 3.1 怎么设置颜色的？

不管是颜色，还是顶点位置。但是通过buffer来传值的。

```buffer，
伪代码：
1、createBuffer
2、bindBuffer到gl上
3、然后根据需求定义数据格式，比如每一个颜色有rgba4个值，因此
  const pastelColors = [
    1.0, 0.8, 0.8, 1.0,    // 淡红色
    0.8, 1.0, 0.8, 1.0,    // 淡绿色
    0.8, 0.8, 1.0, 1.0,    // 淡蓝色
    1.0, 1.0, 0.8, 1.0,    // 淡黄色
  ];
4、然后将数据写到buffer上
5、在shader上使用这些buffer，
具体就得根业务需求，遍历我们的buffer，将buffer里的data一次取出来，然后写到vertex attribute上；

  

```

**为啥每次读取缓存都要调用一次bindBuffer?**

因为webGL一次只能处理一个buffer区, 每次要处理不同的数据时（position， color等业务），都需要切换。







#### 3.2 顶点是怎么绘制的？

**gl.TRIANGLE_STRIP ：这种模式是每3个顶点绘制成一个三角形；**



### 4、怎么在webgl里创建动画？

旋转动画：其实就是在旋转我们的镜头camera





### 5、怎么画3d的东西？

用drawElements来代替drawArrays.





### 6、什么是textures？纹理？怎么加

6.1 先加载textures，利用图片创建纹理

```
// 对于非2的幂纹理，只能使用这些过滤方式
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
// 或
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

// 不能使用这些（会报错）
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
gl.generateMipmap(gl.TEXTURE_2D);  // 不能生成mipmap

Mipmap 需要将纹理逐级缩小为原来的 1/2, 因此会产生小数
```



6.2 将纹理设置到每一个顶点坐标

6.3 绘制



### 7、什么是lighting？怎么加光照

#### 7.1 光照的基本理论：

**法线**：需要知道每一个顶点的法线；

**光照的向量**



**知道光照方向，知道顶点的法线，怎么计算光照强度？**

光照亮度值的计算： 关照向量L和法线向量N 点乘  
$$
v =LN
$$


**知道光照方向，知道顶点的法线，怎么计算反射光的强度？**

反射强度： 反射光向量 点乘  反射方向 



#### 7.2 不同的光照类型：

环境光 Ambient Lighting：渗透到场景里的，无方向性，无论哪个方向影响都一样；

方向性光照 Directional light：一组平行光，从一个方向发射的，平行照过来的；

点光 Point Light：一个光照源，会向各个方向发射光，比如一个灯；



#### **7.3 我们的光照是什么效果？**

我们选择了 环境光 + 方向性光照 (漫反射光)

#### 7.4 **怎么计算反射光？**

```glsl
void main() {
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Position;
  v_TextureCoord = a_TextureCoord;
   // 即使在阴影处也能看到的基础亮度
  highp vec3 ambientLight = vec3(0.1,0.1,0.1);
  // 平行光颜色 - 日落色
  highp vec3 directionalLightColor =  vec3(1.0, 0.8, 0.6);
  // 平行光方向 
  highp vec3 directionalLightDirection = normalize(vec3(1.0, 1.0, 1.0));
  // 转化法线，为什么要转化？如果物体旋转了45度，法线也要跟着旋转45度
  highp vec4 transformedNormal = u_NormalMatrix * vec4(a_Normal, 1.0);
  // 计算光照向量 光照点乘法线，最小为0
  highp float directionalLightWeighting = max(dot(transformedNormal.xyz, directionalLightDirection), 0.0);
  // 光照强度 = 环境光 + 漫反射光
  v_Lighting = ambientLight + (directionalLightColor * directionalLightWeighting);
}
```



#### 7.5 想要计算高光反射，镜面反射，需要使用反射向量和视线向量。

这就是 Phong 反射模型：

```glsl
void main() {
    // 1. 视线向量（从顶点指向眼睛）
    vec3 viewPosition = vec3(0.0, 0.0, 5.0);  // 眼睛位置
    vec3 vertexPosition = vec3(a_Position);    // 顶点位置
    vec3 viewDir = normalize(viewPosition - vertexPosition);

    // 2. 反射向量（光线被法线反射的方向）
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  	// 转化法线，为什么要转化？如果物体旋转了45度，法线也要跟着旋转45度
	  highp vec4 transformedNormal = u_NormalMatrix * vec4(a_Normal, 1.0);
    vec3 normal = normalize(transformedNormal.xyz);
  	// 计算反射
    vec3 reflectDir = reflect(-lightDir, normal);

    // 3. 计算高光强度
    float specularStrength = 0.5;           // 高光强度
    float shininess = 32.0;                 // 光泽度（越大越集中）
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * lightColor;
}
```





### 8、怎么渲染一个video纹理?

在渲染的时候，在每一帧，对webgl的texture进行替换，用video的一帧图片，来代替静态的图片；

```ts
function render(now: number) {
    now *= 0.001; // convert to seconds
    deltaTime = now - then; // 计算时间差
    then = now;

    if (copyVideo) {
      updateTexture(gl, texture, video); // 在这里设置webgl的TEXTURE_2D
    }
    drawScreen(gl, programInfo, buffers, texture, cubeRotation);
    cubeRotation = cubeRotation + 0.1 * deltaTime; // 每秒旋转0.5度
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
```



### 9、投诉矩阵的遮挡关系

![image-20241123111456114](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2024/11-23/image-20241123111456114.png)

画两个三角形，然后不停的旋转camera，测试两个三角形透视到画布上的深度问题；



![深度测试-bad](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2024/11-23/%E6%B7%B1%E5%BA%A6%E6%B5%8B%E8%AF%95-bad.gif)

可以看到上面一直是绿色在前面，因为我们先绘制的红色三角形，绿色的就覆盖上去了。这是不符合我们正常视觉的。





这个其实就是一个深度问题, 需要开启深度测试；

```
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

效果就正常了

![深度测试](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2024/11-23/%E6%B7%B1%E5%BA%A6%E6%B5%8B%E8%AF%95.gif)

但是这个深度测试，仅仅对于z轴相差角度的图形有用，在相等的情况，就还是处理不好，可以看到下图，会一直闪频。这个叫做z-fighting

![深度测试-bad2](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2024/11-23/%E6%B7%B1%E5%BA%A6%E6%B5%8B%E8%AF%95-bad2.gif)



可以通过以下几种方式优化深度测试问题：

1、稍微调整 z 值，让两个三角形有细微的深度差：

init-buffers.ts

```ts
const positions = [

  // 第一个三角形 (z = 0.0)

  -1.0, 1.0, 0.0,  // 左下

   0.0, -1.0, 0.0,  // 右下

   1.0, 1.0, 0.0,  // 右上

  // 第二个三角形 (z = 0.1) - 略微靠后

  -1.0, -1.0, 0.1,  // 左下

   1.0, -1.0, 0.1,  // 右下

   0.0, 2.0, 0.1,  // 右上

 ];
```

 

2. 使用 gl.POLYGON_OFFSET_FILL 是解决共面多边形深度冲突的标准方法：
