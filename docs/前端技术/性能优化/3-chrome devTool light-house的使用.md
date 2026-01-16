## Light House作用

可以对网站性能进行评测

评估指标：FCP, LCP, TBT, CLS

然后会给出一些技术建议：

比如FCP相关的，主要想提高首屏的渲染效率。可能会给出这么写建议：

- 检测到一些**可能会阻塞渲染的资源**
- 估计服务器响应时间，评估是否需要朝这个方向去减少
- 开启压缩，比如gzip，brotli, deflate等（gzip用来压缩文件，**Brotli:** 专门为网络内容传输而设计）
- 用下一代image格式来保持节省image大小





### CLS相关

cls描述反馈的主要是一个页面上布局抖动的问题，会影响用户的感官体验。

一般问题就是图片加载造成高度变化，或者布局上的变化。

CLS的指标越低越好。

![image-20250328100759315](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-03-28/image-20250328100759315.png)





### FCP相关



#### 哪些资源可能会认为阻塞渲染？

[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview?hl=zh-cn) 会标记两种类型的阻塞渲染的网址：脚本和样式表。

`<script>` 标记，其具有以下特征：

- 位于文档的 `<head>` 中。
- 没有 `defer` 属性。
- 没有 `async` 属性。

`<link rel="stylesheet">` 标记，其具有以下特征：

- 没有 `disabled` 属性。如果具有此属性，则浏览器不会下载样式表。
- 没有与用户的设备具体匹配的 `media` 属性。`media="all"` 会被视为会阻塞渲染。



#### 找到一些关键资源，避免不必要的代码被加载

怎么找到关键资源？通过`command + shift +p` 打开 coverage，然后用这个chrome的devtool，找出非关键 CSS 和 JS。当我们运行也页面时，该标签页会显示使用了多少代码，以及加载了多少代码。 

![image-20250327174404798](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-03-27/image-20250327174404798.png)

**红色区域代表没加载的内容**





**怎么消除阻塞渲染的脚本？**

- 结合tree shaking和dynamic load，这里有很大的优化空间
- 用一些defer，async属性，来标记这些js不用在frist load时加载



**怎么消除阻塞渲染的css？**

在 HTML 页面的 `head` 里，用 `<style>` 加载first load所需的关键css。然后，使用 `preload` 链接异步加载其余css。



 

