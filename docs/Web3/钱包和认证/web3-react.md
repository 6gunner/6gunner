


https://github.com/Uniswap/web3-react

uniswap出的一个dapp框架，管理钱包连接状态；

### 带着问题：

#### 怎么用？需要哪些Provider？ 连接不同的钱包怎么唤醒？

v8的

只需要一个@web3-react/core/Web3ReactProvider

需要属性：connectors

唤醒方法：调用connector的active方法


#### 怎么支持监测用户已经安装的插件？

框架并没有自带，需要自己根据EIP-6963来实现；
原理就是去监听钱包通知的announceProvider事件，从而知道以后有哪些钱包·


#### web3-react的设计原理

@web3-react/core定义了一个Connector的基类，这个基类定义了基础的方法和属性

- provider是一个web3的Provider，每一个Connector的子类都会提供一个自己的provider实现。
- activate 抽象方法，可以建立网络连接
- deactive 用来断开和网络的连接

```js
export declare abstract class Connector {
    /**
     * An
     * EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) and
     * EIP-1102 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md}) compliant provider.
     * May also comply with EIP-3085 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3085.md}).
     * This property must be defined while the connector is active.
     */
    provider: Provider | undefined;
    protected readonly actions: Actions;
    /**
     * @param actions - Methods bound to a zustand store that tracks the state of the connector.
     * Actions are used by the connector to report changes in connection status.
     */
    constructor(actions: Actions);
    /**
     * Initiate a connection.
     */
    abstract activate(...args: unknown[]): Promise<void> | void;
    /**
     * Initiate a disconnect.
     */
    deactivate(...args: unknown[]): Promise<void> | void;
}
```



##### 子类1：@web3-react/metamask

主要适用于浏览器插件（比如metamask）内置的injected provider。

```tsx
import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

export const [metaMask, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask(actions))

const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks
```



##### 子类2：@web3-react/network-connector

@web3-react/network下是对@web3-react/core基类的一个实现，

可以手动传入rpcurl，来建立连接。

network实现了具体的active方法，如下代码所示：通过传入chainId来找到对应的url进行连接。

```tsx
export declare class Network extends Connector {
	/**
     * Initiates a connection.
     *
     * @param desiredChainId - The desired chain to connect to.
     */
    activate(desiredChainId?: number): Promise<void>;
}
```

network的provider是一个`EIP-1193`Bridge类，里面集成了ethers.providers.Provider和ethers.signer。



具体用法:

```js
import { initializeConnector } from "@web3-react/core";
import { Network } from "@web3-react/network";
import { URLS } from '../chains'

const [network, hooks] = initializeConnector(
  (actions) => new Network(actions, URLS),
  // 支持的urls
  Object.keys(URLS).map((chainId) => Number(chainId))
);

const {
  useChainId,
  useAccounts,
  useError,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks;
```




