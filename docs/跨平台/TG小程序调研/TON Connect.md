## TON Connect

`ton connect`是一个协议？（ton钱包 和 dapp之间的链接协议）

ton connect提供了@tonconnect/ui-react, @tonconnect/ui，@tonconnect/sdk等插件，按需使用。



## @tonconnect/ui-react

### TonConnectUIProvider

ui-react库里提供的组件，全局上下文provider，TonConnectButton和hooks必须在外层包装TonConnectUIProvider



### ton的交易发送

extraCurrency：可以在一笔交易里，指定一些额外的token transfer。

```ts
const transactionWithExtraCurrency = {
    validUntil: Math.floor(Date.now() / 1000) + 60,
    messages: [
        {
            address: "EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
            // 指定额外货币
            extraCurrency: {
                100: "10000000" // key: value
            }
        }
    ]
}

// 键（key）：表示货币的ID（通常是一个整数）
// 值（value）：表示该货币的发送金额（以最小单位表示，通常是纳诺单位）

tonConnectUI.send(transactionWithExtraCurrency)
```



#### ps: ton的单位

**TON（通常简称为TON或Toncoin）**

- 这是最常用的主要单位
- 1 TON = 10^9 （nanoTON）





