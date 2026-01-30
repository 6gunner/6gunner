如何创建widgets，重写build 方法

分类：**stateful widget** vs **stateless widget**

大部分widget都是StatelessWidget

StatefulWidget 维护State，需要重写 createState方法，返回一个`State<T>`对象

## 一些常用的Widget

自动撑满屏幕的：Center， ListView
和children保持一致的：Transform， Opacity
固定尺寸：Image， Text
受Constrain影响的：ROw， Column

Container
类似于box 模型，默认填满屏幕的

通过Constraint设置margin和padding
设置padding的单位EdgeInsets.all(10.0)

自适应的宽度：IntrinsicWidth

Hero Widget的作用：同样的tag可以做渐变效果，flutter会自动加动画
