## 1、怎么配置开发环境？

https://github.com/FiloSottile/mkcert 装个这个，本地生成个cert，
双击安装，并且在keys里认证信任下

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2024-10-14/image-20241014172907199.png" alt="image-20241014172907199" style={{ zoom: '33%' }} />

再vite里配置下，

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2024-10-14/image-20241014172849888.png" alt="image-20241014172849888" style={{ zoom: '33%' }} />

启动，再然后用`https://${ip}:${port}/ `配置到tgbot里就可以直接 dev了。

创建bot，创建app，enable min-app

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2024-11-13/image-20241113093919836.png" alt="image-20241113093919836" style={{ zoom: '50%' }} />

## 2、tma的通信机制

我们为了区分概念，定义了methods和events两种概念。 **本质上都是event通讯**

methods：请求从tma发送给tg-app，由tg-app来处理

events: tg-app下发到tma，tma接收到后进行处理

### methods

#### web版本

因为web版本的telegram-app是用ifram来展示mini-app的，因此我们可以用postMessage来发送event，从而实现 tma和telegram app（tg-app）的通信

```ts
const data = JSON.stringify({
  eventType: 'web_app_setup_back_button',
  eventData: {
    is_visible: true,
  },
});

window.parent.postMessage(data, 'https://web.telegram.org');
```

#### desktop和mobile版本

这两个平台的tg-app里，都提供了一个全局方法：

`window.TelegramWebviewProxy.postEvent`。 如果tma想调用tg-app的method，可以用：

```ts
const data = JSON.stringify({ is_visible: true });

window.TelegramWebviewProxy.postEvent('web_app_setup_back_button', data);
```

#### 总结：

不同平台的tg，提供的method方法都不一致，所以社区开发了： [@telegram-apps/sdk](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/2-x) 封装了统一的方法对外暴露，底层兼容了不同平台的method调用。

```
import { postEvent } from '@telegram-apps/sdk';

postEvent('web_app_set_header_color', { color_key: 'bg_color' });
```

可以调用的方法doc：https://docs.telegram-mini-apps.com/platform/methods#available-methods

### events

同上，web，desktop，以及不同操作系统的mobile。都提供了不同的对象来监听event。

```ts
window.Telegram.WebView.receiveEvent('popup_closed', {
  button_id: 'cancel',
});
```

event有两个签名：

eventType和eventData

```ts
type ReceiveEvent = (eventType: string, eventData: unknown) => void;
```

同样 [@telegram-apps/sdk](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/2-x) 封装了统一的方法来监听消息：

```ts
import { on } from '@telegram-apps/sdk';

// Start listening to "viewport_changed" event. Returned value
// is a function, which removes this event listener.
const removeListener = on('viewport_changed', (payload) => {
  console.log('Viewport changed:', payload);
});

// Remove this event listener.
removeListener();
```

events文档：https://docs.telegram-mini-apps.com/platform/events#available-events

## 3、launch params

tg里每一个mini-app点击启动的时候，会自动拼上一些参数到url里，

```
tgWebAppData=...&tgWebAppVersion=6.2&...
```

开发者可以从`window.location.hash`里拿到可能需要的信息，比如

- deviceInfo
- tgWebAppVersion
- ...
  具体可以看：https://docs.telegram-mini-apps.com/platform/launch-parameters#parameters-list

## 4、start params

假如我们的bot link配置带了query param,
比如 `https://t.me/botusername?startattach=ABC`

那么mini-app启动的时候，可以通过start param拿到ABC
存储在launch params里的`tgWebAppStartParam`

## 5、init data

init data和用户的信息有关，当用户点击mini-app的时候，会将用户的信息携带到
launch params的`tgWebAppData`里。

init data可以用来在服务端进行鉴权，具体看

具体参数有这些：
https://docs.telegram-mini-apps.com/platform/init-data#parameters-list
