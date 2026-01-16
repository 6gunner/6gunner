Dashboard 用来管理api key


## Customize login 


```
setShowAuthFlow
```


## quick start 



### 0 - install sdk 支持 viem和wagmi

EtherumConnectors支持所有的evm chain



### 1 - initialize sdk

两种：

- dynamic ， 提供了一个widge，有一套ui。

- static button





提供一整套登录的解决方案，包含web2 oauth，web3的各个钱包；



### 2- dynamic + next-auth

需要几个env变量：

```
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID // dynamic的env_id
NEXT_DYNAMIC_BEARER_TOKEN // 生成jwt的token用的？


```



安装依赖，并且添加dynamic provider

```
```



```ts
// app/components/dynamic-wrapper.ts

"use client";

import { DynamicContextProvider } from "../lib/dynamic";

export default function ProviderWrapper({ children }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
```

这里分两种情况：app router和page router：

如果是app router，在`app/api/auth/[...nextauth]/route.js`里添加router handler
```
import { handlers } from "auth"
export const { GET, POST } = handlers

```


page router：
```

```

# route.ts

`可以添加auth.ts，export出一些方法：

```ts
handlers，auth, signIn, signOut 
```

在pages router里需要`pages/api/auth/`.

```

```





## 结合nextjs的登录鉴权：



### 方案一、简单的后端鉴权

前端只需要将authToken拿到，然后和后端约定一个验证方式。比如将token放到headers里

```
 headers: {
    Authorization: `Bearer ${authToken}`,
  },
```

一旦后端验证这个authToken是正常的，那么可以与前端约定一个新的鉴权机制（比如剩下的接口可以完全走后端自己下发的token），这样就避免每次去dynamic server验证一次。



### 方案二、和next-auth一起验证







