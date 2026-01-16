## 避免强制布局

浏览器在一帧里渲染 大概执行这么个流程：先执行js，然后计算样式，然后进行布局。

![使用 Flexbox 作为布局。](https://web.dev/static/articles/avoid-large-complex-layouts-and-layout-thrashing/image/using-flexbox-layout-0c9955c54a296.jpg?hl=zh-cn)

但是js可以强制浏览器提前进行layout，称为**强制同步布局**。

会造成什么问题：举个例子，下面这个代码就会有问题。

```js
// Schedule our function to run at the start of the frame:
requestAnimationFrame(logBoxHeight);

function logBoxHeight () {
  box.classList.add('super-big');

  // Gets the height of the box in pixels and logs it out:
  console.log(box.offsetHeight);
}
```

因为在logBoxHeight里为了console.log高度，浏览器必须先应用样式更改（由于增加了 `super-big` 类），然后运行布局。

这时它才能返回正确的高度

**这是不必要的，并且可能是开销很大的工作。**





## 避免布局抖动

还有一种问题就是在js里通过循环，频繁的触发了浏览器的重新布局。

比如下面的代码就有问题：

```js
function resizeAllParagraphsToMatchBlockWidth () {
  // Puts the browser into a read-write-read-write cycle.
  for (let i = 0; i < paragraphs.length; i++) {
    paragraphs[i].style.width = `${box.offsetWidth}px`;
  }
}
```

每次循环都会让浏览器重新进行布局，计算高度。

