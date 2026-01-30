
问题1：生产环境无法在pc-web端打开

现象：控制台提示报错“Unable to retrieve launch parameters from any known source. Perhaps, you have opened your app outside Telegram?”

分析：tg小程序部署production后，似乎有一个限制，无法在web端打开。
可能和sdk里默认在retrieveLaunchParams有关系。
这个未来不知道怎么产品角度怎么处理：
a.如果想兼容web端，就需要提供一些mock参数，但这个在production似乎不合适。
b.如果不允许在tg小程序以外打开，那么可能对用户不友好。

获取我们可以尝试，pc-web端不登录，但是只能玩有限次数（比如5次）；tg端登录拿到用户信息后，可以提高使用次数（比如10次）；再想玩那就需要充值coin。

技术角度解答：
1. 这个问题确实与SDK的`retrieveLaunchParams`有关。Telegram小程序默认设计是在Telegram客户端内运行的，所以SDK会尝试获取Telegram的启动参数。
2. 解决方案：
   - 在SDK初始化时添加fallback逻辑，当检测到在web环境时使用默认参数



**问题2**：@telegram-apps/sdk究竟在干嘛？使用流程是什么？有哪些lifecycle callback或者event？

解答：
我理解这个SDK主要是提供了一些比较简单的方法，帮助我们和telegram客户端进行交互。比如：
   - Telegram客户端通信，接收消息event，发送message。
   - 获取用户信息
   - 管理小程序生命周期

2. 主要生命周期函数和事件：
   - `onLaunch`: 小程序启动时触发
   - `onShow`: 小程序显示时触发
   - `onHide`: 小程序隐藏时触发
   - `onError`: 发生错误时触发
   - `onPageNotFound`: 页面不存在时触发

**问题3**：除了一些封装调用底层api的接口之外，我还会用sdk调用到哪些接口？能不能举例说一下？

解答：
除了底层API封装外，SDK还提供了一些高级接口，例如：

1. 用户认证相关：
   - `getUserInfo`: 获取用户信息
   - `login`: 用户登录

2. 支付相关：
   - `requestPayment`: 发起支付
   - `checkPayment`: 检查支付状态

3. 数据存储：
   - `setStorage`: 存储数据
   - `getStorage`: 获取数据

4. 界面交互：
   - `showToast`: 显示提示
   - `showModal`: 显示对话框
   - `showLoading`: 显示加载中




## sdk里的一些重要lib库

`@telegram-app/signals` 和 `@telegram-app/bridge`


### `@telegram-app/signals` 

是的，提供了一个signal construct

**响应式对象**

signal 可以创建一个可以被监听的信号对象
```js
import { signal } from '@telegram-apps/signals';

const isVisible = signal(false);
```

当signal发生变化时，可以自动触发callback函数；

```js
const removeListener = isVisible.sub((current, prev) => {
  console.log('Value changed from', prev, 'to', current);
});

isVisible.set(true);

inVsible.reset();

// Remove the listener whenever needed.
removeListener();
```


**响应式更新机制**
这个`@telegram-app/signals`也提供了响应式更新机制，用computed来实现：
```ts
import { signal, computed } from '@telegram-apps/signals';

const a = signal(2);
const b = signal(2);
const sum = computed(() => a() + b()); // 这个sum返回结果和signal一样，只是缺少set和reset方法。

a.set(5); // sum becomes 7
b.set(5); // sum becomes 10

console.log(sum()) // // 4
```

computed会自动搜集依赖，当依赖发生变化时，自动重新计算结果；



**批量更新**

如果想避免每次更新signal都触发重新计算，可以使用batch模式来批量更新

```ts
import { signal, computed, batch } from '@telegram-apps/signals';

const a = signal(1);
const b = signal(2);
const c = signal(3);
const sum = computed(() => a() + b() + c()); // 6

// Without batching, re-computation happens 3 times:
a.set(2); // sum recomputes and becomes 7
b.set(3); // sum recomputes and becomes 8
c.set(4); // sum recomputes and becomes 9

// Reset each signal.
a.reset();
b.reset();
c.reset();
// Note: reset calls the set method, which also causes
// the sum signal to recompute.

// Now, let's optimize using the batch function:
batch(() => {
  a.set(2);
  b.set(3);
  c.set(4);
});
// At this point, sum will recompute only once because
// batch causes the sum signal to wait for the function to complete,
// and then it triggers the recomputation.
console.log(sum()); // 9
```


