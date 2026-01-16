## 基础中的基础

Scene

### 创建app
### 添加到dom里
### 添加资源图片

```
const asset = await Asset.load("xxxx.png");
let sprite = Sprite.from(asset);
app.state.addChild(sprite);
```




#### 处理边界问题：

dudeBounds 创建了一个矩形区域，它比实际屏幕尺寸要大：

宽度 = 屏幕宽度 + 100*2

高度 = 屏幕高度 + 100*2

这样做的目的通常是：

让精灵有一个比屏幕稍大的活动范围

当精灵移动到屏幕边缘时，不会立即消失，而是可以稍微超出一点屏幕



```ts
const dudeBoundsPadding = 100;
  const dudeBounds = new Rectangle(-dudeBoundsPadding, -dudeBoundsPadding, app.screen.width + dudeBoundsPadding * 2, app.screen.height + dudeBoundsPadding * 2);
  
  
  app.ticker.add(() => {
    for (let i = 0; i < maggots.length; i++) {
      const dude = maggots[i];

      // 检查水平方向，这样精灵移动到这个边界外，可能会让它从另一边重新进入，创造一个无限循环的移动效果。
      // 当精灵移出左边界时，将其传送到右边
      if (dude.x < dudeBounds.x) {
        dude.x += dudeBounds.width;
      } else if (dude.x > dudeBounds.width) {
        // 当精灵移出右边界时，将其传送到左边
        dude.x -= dudeBounds.width;
      }

      // 检查垂直方向
      // 当精灵移出上边界时，将其传送到下边
      if (dude.y < dudeBounds.y) {
        dude.y += dudeBounds.height;
      } else if (dude.y > dudeBounds.height) {
        // 当精灵移出下边界时，将其传送到上边
        dude.y -= dudeBounds.height;
      }


      // Increment the ticker
      tick += 0.1;
    }
  });
```



#### 制作蠕动效果：

```ts
// 正弦函数会返回 - 1 到 1 之间的值，它产生一个平滑的循环波形，offset为每一个dude添加偏移量，使得不同精灵的波动不同步；
// 0.95 是波动的中心值，0.05 是波动的幅度，使得波动的范围在 0.95 - 0.05  到 0.95 + 0.05 之间
dude.scale.y = 0.95 + Math.sin(tick + dude.offset) * 0.05;
```



#### 处理资源加载

一次性加载多个资源，然后放到一个sceen里





### 常见的Scene场景

#### Container 

所有的scene都是继承自Container

- Sprite

   is a display object that uses a texture

  - [AnimatedSprite](https://pixijs.download/release/docs/scene.AnimatedSprite.html) is a sprite that can play animations

- [TilingSprite](https://pixijs.download/release/docs/scene.TilingSprite.html) a fast way of rendering a tiling image

- [NineSliceSprite](https://pixijs.download/release/docs/scene.NineSliceSprite.html) allows you to stretch a texture using 9-slice scaling

- [Graphics](https://pixijs.download/release/docs/scene.Graphics.html) is a graphic object that can be drawn to the screen.

- Mesh

  empowers you to have maximum flexibility to render any kind of visuals you can think of

  - [MeshSimple](https://pixijs.download/release/docs/scene.MeshSimple.html) mimics Mesh, providing easy-to-use constructor arguments
  - [MeshPlane](https://pixijs.download/release/docs/scene.MeshPlane.html) allows you to draw a texture across several points and then manipulate these points
  - [MeshRope](https://pixijs.download/release/docs/scene.MeshRope.html) allows you to draw a texture across several points and then manipulate these points

- Text

  可以用自定义font

  - [BitmapText](https://pixijs.download/release/docs/scene.BitmapText.html) render text using a bitmap font
  - [HTMLText](https://pixijs.download/release/docs/scene.HTMLText.html) render text using HTML and CSS

