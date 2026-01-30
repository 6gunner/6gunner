ton wallet 其实是一个 和tg mini app，托管钱包。无法导出私钥

## Wallet and TON Space啥区别？

**服务相关：**

- ton space是三方的服务，帮助你在TON区块链上创建非托管钱包（A non-custodial wallet ）的服务提供商，提供了ui来让用户操作您的钱包；
- wallet是托管钱包，（**居然是特么的托管钱包**）是一个中心化服务，你的私钥存在别人的服务器上，但是你有权限去操作这个钱包

**私钥相关**：

- ton space是用户拥有完全控制权，只有用户能控制私钥（通过助记词）
- wallet的私钥不在用户手上，是一个中心化服务。

## Wallet的操作

### **1、怎么将ton wallet切换到测试网络**

wallet不支持，只能用ton space。

打开钱包，setting => ton space =>选择测试网络，

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-04-03/image-20250403105042993.png" alt="image-20250403105042993" style={{ zoom: '50%' }} />

### 2、ton testnet faucet领取

在tg里找到@testgiver_ton_bot（Testgiver TON Bot），验证领取；

## 怎么用code换起wallet来进行转账？

安装依赖：

```


pnpm add @ton/ton @ton/crypto @ton/core buffer

```
