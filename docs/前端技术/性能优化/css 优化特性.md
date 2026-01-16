
## contain

4种类型
- size： 元素的大小计算和子元素没关系
- layout
- paint
- style

组合类型：
- content:  结合了 `layout`、`style` 和 `paint`, 告诉浏览器 素是独立的，其内部的更改不应该触发整个页面的重新计算。
- strict: 结合了上面4种

优点：
- 创建了一个隔离区域，内部不会影响外部
- 性能优化，限制了**一些？xxx**操作，仅仅在dom子树中进行，而不是整个页面，可以提高渲染性能。
- 


## content-visibility

下面3个css都能让一个元素隐藏，不同点在于：

`content-visibility: hidden` ：
`display: none`：  浏览器会将元素彻底删除，并且清空内存

