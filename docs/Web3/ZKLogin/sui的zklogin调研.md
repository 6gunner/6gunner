* https://docs.google.com/document/d/1eTkAmcUOTWxnuvxbC02H7XzUaop9wB0Gs2WEw5UgI4c/edit
* https://docs.sui.io/concepts/cryptography/zklogin
* https://docs.sui.io/guides/developer/cryptography/zklogin-integration/zklogin-example
* https://docs.sui.io/guides/developer/cryptography/zklogin-integration
* https://sui-zklogin.vercel.app/
* https://github.com/jovicheng/sui-zklogin-demo?tab=readme-ov-file



### 带着问题：

**Sui这链底层有什么不一样的？是EVM兼容的么？**



Sui链底层有一点不一样。sui核心是对象模型，所有的概念：地址，交易等都有一个ObjectId；

不兼容EVM，它的合约编程语言是**Move**

理解**PTBs**是理解Sui链的核心





**为什么地址会不一样？**

Sui的地址是32bytes，`0x02a212de6a9dfa3a69e22387acfbafbb1a9e591bd9d636e7895dcfc8de05f331`，0x后跟64个十六进制字符。

Ethers的地址是20bytes，`0xF0110D0fa36101990C12B65e292940dC4B8D2b82`, 0x后面接40个十六进制字符；

Sui的地址格式是**ed25519**



**它上面的AA Acount是默认就带的吗？**



**怎么去SUI上交易？**

Sui的一个交易就是Object的转化，理解这个有助于看懂demo后面的逻辑；





**怎么去连上SUI的provider？ethersjs可以吗？**

Rpc： https://fullnode.devnet.sui.io:443

得用`@mysten/sui`这个sdk来连接交互



**Move编程语言？**



**Sui里的bcs是什么？** 

Binary Canonical Serialization 二进制规范序列化。

bsc是用来在sui上做序列化和反序列化的一个工具，能支持rust丰富的类型；

这个sdk里为我们实现了typescript版本的bcs



**PTBs？**

Programmable Transaction Blocks 可编程的交易区块。感觉有点像btc的psbt

允许我们在一次tx里，将一系列command组合起来，然后同时触发。最多支持1024个command，但是不能是loop；

可以提高效率，节省gas，

可以自由组合，灵活性很高；



PTB重要的两个属性：inputs, commands。

inputs是command的入参

command有以下类型，不同类型代表不同操作：

- `TransferObjects`: 向一个地址transfer object
- `SplitCoins` 把相同类型的coin拆开，是不是等于转账？
- `MergeCoin`: 将相同类型的coin合并
- `MakeMoveVec`: 构建Move数组
- `MoveCall`： 调用Move
- `Publish`: 发布一个move package(发布合约)
- `Upgrade`: 升级一个package(升级合约)



**理解ptb怎么构造的**

https://docs.sui.io/concepts/transactions/prog-txn-blocks#argument-structure-and-usage
