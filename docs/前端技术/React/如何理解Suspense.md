## 怎么理解Suspense

将Suspense理解成组件树上的一个“断路器”

当一个组件还没准备好时（比如需要加载数据/需要加载js代码）React就会暂停渲染组件，并且向上冒泡，直到被最近的Suspense捕获。

然后用降级方案去渲染（也就是我们的fallback）



Suspense阻塞的不是组件的render，而是阻止一个组件树进入commit阶段

当发现组件没有准备好时，这个组件的render就会被中断。



## 关于Suspense的作用

这是错误的❌：Suspense不应该被理解成一个loading组件

- 作用1：Suspense配合LazyComponent做代码的拆分；

- 作用2：React配合支持Suspense的Query库，比如tanstackQuery, 实现数据获取的Suspense效果；

  这种不需要指令式的`if (loading) {return <Spin/>}`类似的代码了。

- 作用3：配合useTransition，做到UI渐进式稳定。比如下面的场景里，不会因为“切换tab”出现白屏。

假设有2个组件通过一个tab状态来控制显影，ProfilePage第一次加载是需要准备数据。

如果我们不用`useTransistion`, 那么会在切换tab时，立即进入fallback ui.

但是如果我们在useTransistion的回调里修改tab，不会立即触发Suspense的fallback ui，而是等组件准备才会渲染。

```tsx
export const Component =  function App() {
  const [tab, setTab] = useState('home');

  // 1. 使用 useTransition 钩子
  const [isPending, startTransition] = useTransition();

  function handleTabChange(nextTab) {
    if (nextTab === 'profile') {
      // 2. 将导致 Suspense 挂起的状态更新包裹在 startTransition 中
      startTransition(() => {
        setTab(nextTab);
      });
    } else {
      setTab(nextTab);
    }
  }

  return (
    <div style={{ opacity: isPending ? 0.7 : 1 }}> {/* 3. 视觉反馈：加载时旧界面变淡，但不消失 */}
      <nav>
        <button onClick={() => handleTabChange('home')}>首页</button>
        <button onClick={() => handleTabChange('profile')}>
          个人资料 {isPending && " (加载中...)"}
        </button>
      </nav>
      <hr />
      {/* 
        如果没有 startTransition，点击按钮会立刻看到这个 fallback。
        有了 startTransition，React 会尽量在后台加载 ProfilePage，直到加载完才切换。
      */}
      <Suspense fallback={<p>正全力跳转中（这里通常不会在 Transition 时闪现）...</p>}>
        {tab === 'home' ? <p>欢迎来到首页</p> : <ProfilePage />}
      </Suspense>
    </div>
  );
}
```





## Suspense fallback的原理是什么？

当react组件渲染的过程中，遇到还没准备好数据的情况时（比如异步加载数据），会暂停渲染这个组件，throw promise.

Suspense会捕获这个promise，然后展示fallback ui。

当Promise resolved后,React会尝试重新渲染子组件。

如果Promise不resolve，Suspense会一直展示fallback



