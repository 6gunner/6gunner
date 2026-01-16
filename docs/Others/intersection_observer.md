## API介绍

### entry对象里有哪些属性？

```ts
interface IntersectionObserverEntry {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry/boundingClientRect) */

  readonly boundingClientRect: DOMRectReadOnly;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry/intersectionRatio) */
  //  视图和target相交的面积占target的比例
  readonly intersectionRatio: number;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry/intersectionRect) */
  // 视图和target相交的区域
  readonly intersectionRect: DOMRectReadOnly;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry/isIntersecting) */
  // 当前这一刻，target是否可见
  readonly isIntersecting: boolean;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry/rootBounds) */

  readonly rootBounds: DOMRectReadOnly | null;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry/target) */
  // 被观察的对象
  readonly target: Element;

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry/time) */
  readonly time: DOMHighResTimeStamp;
}
```

boundingClientReact是target的boundingClient信息

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-02-17/image-20250217165327414.png" alt="image-20250217165327414" style={{ zoom: '50%' }} />

intersectionReact是target和viewpoint区域相交的boudingClient信息，一个readonly的intersection区域，（但是这个dom并不存在）

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-02-17/image-20250217164935148.png" alt="image-20250217164935148" style={{ zoom: '50%' }} />

### 构造函数的属性

```ts
new IntersectionObserver((entries) => {
  /* ... */
}, options);
```

第一个参数是callback。callback会在entry进入、离开的时候各触发一次；

第二个参数是options，具体结构如下：

```
{
	threshold: 当target达到多少阈值才触发intersectionobserver的callback事件, 可以传入一个数组：[0.1, 0.5, 1]
	root: 指定viewer的区域
	rootMargin: 可以扩充root区域的框高，rootMargin属性和css的盒子模型一样
}
```

注意：IntersectionObserver的触发是异步，且要等浏览器处于idle空闲期才会触发，所以定义很多阈值并不能保证一定会触发；

### 常见用途：

- 图片的懒加载
- 滚屏加载

```tsx
'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const IntersectionDemo = () => {
  const [intersection, setIntersection] = useState(0);
  const targetRef = useRef(null);

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    debugger;
    entries.forEach((entry) => {
      // console.log("BoundingClientRect:", entry.boundingClientRect);
      // console.log("IntersectionRect:", entry.intersectionRect);
      // console.log("RootBounds:", entry.rootBounds);
      console.log('IntersectionRatio:', entry.intersectionRatio);
      setIntersection(entry.intersectionRatio);
    });
  }, []);

  useEffect(() => {
    const options = {
      root: document.getElementById('container'),
      rootMargin: '0px',
      // 设置多个阈值点
      threshold: [0.5, 0.8],
    };

    const observer = new IntersectionObserver(callback, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [callback]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">
          Intersection Observer Threshold 演示
        </h2>

        {/* 进度指示器 */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm">
              交叉比例: {(intersection * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${intersection * 100}%` }}
            />
          </div>
        </div>

        {/* 滚动容器 */}
        <div id="container" className="h-64 overflow-y-auto border rounded-lg">
          {/* 上部填充 */}
          <div className="h-64 bg-gray-50 flex items-center justify-center">
            <span className="text-gray-400">向下滚动</span>
          </div>

          {/* 观察的目标元素 */}
          <div
            ref={targetRef}
            className="h-32 bg-blue-100 border-2 border-blue-500 flex items-center justify-center"
          >
            <span className="text-blue-600 font-medium">观察的元素</span>
          </div>

          {/* 下部填充 */}
          <div className="h-64 bg-gray-50 flex items-center justify-center">
            <span className="text-gray-400">继续滚动</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntersectionDemo;
```
