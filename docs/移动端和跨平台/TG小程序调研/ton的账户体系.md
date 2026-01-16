## 地址格式

| Address beginning | Binary form | Bounceable | Testnet-only |
| ----------------- | ----------- | ---------- | ------------ |
| E...              | 000100.01   | yes        | no           |
| U...              | 010100.01   | no         | no           |
| k...              | 100100.01   | yes        | yes          |
| 0...              | 110100.01   | no         | yes          |
|                   |             |            |              |

比如地址：`0QAA26V1zFtBMIllbm7h6tk31eZe_nt2otwS9XkurOFrlTAg`

按图标可以简单分析，是一个测试网，且不支持bounce的地址

通过代码来获取不同的address

```tsx
let workchain = 0; // Usually you need a workchain 0
let wallet = WalletContractV5R1.create({
  workchain,
  publicKey: keyPair.publicKey,
});
// 期待的地址：0QAA26V1zFtBMIllbm7h6tk31eZe_nt2otwS9XkurOFrlTAg
console.log('所有可能的地址格式：');
// console.log(`1. 主网 bounceable: ${wallet.address.toString({ bounceable: true })}`);
// console.log(`2. 主网 non-bounceable: ${wallet.address.toString({ bounceable: false })}`);
// console.log(`3. 测试网 bounceable: ${wallet.address.toString({ testOnly: true, bounceable: true })}`);
// console.log(`4. 测试网 non-bounceable: ${wallet.address.toString({ testOnly: true, bounceable: false })}`);
// console.log(`5. 主网 bounceable (urlSafe): ${wallet.address.toString({ urlSafe: true, bounceable: true })}`);
// console.log(`6. 主网 non-bounceable (urlSafe): ${wallet.address.toString({ urlSafe: true, bounceable: false })}`);
// console.log(`7. 测试网 bounceable (urlSafe): ${wallet.address.toString({ urlSafe: true, testOnly: true, bounceable: true })}`);
console.log(
  `8. 测试网 non-bounceable (urlSafe): ${wallet.address.toString({ urlSafe: true, testOnly: true, bounceable: false })}`
);
```

## Cell

cell是TON区块链数据存储的基本单位。链上存储的都是cell，数据模型的基础。

Cell是TON数据模型的基础，类似于其他区块链中的字节数组或键值对，但设计更为精巧和灵活。每个Cell：

1. **有限大小**：每个Cell最多可以存储1023位数据(约128字节)
2. **引用结构**：每个Cell最多可以包含4个对其他Cell的引用
3. **二进制性质**：Cell存储的是原始二进制数据(bits)
4. **不可变性**：一旦创建，Cell内容不可修改(只能创建新Cell)

### Cell的结构

一个标准Cell由两部分组成：

- **数据部分(Data/Bits)**：存储实际的二进制数据
- **引用部分(References)**：存储指向其他Cell的引用(最多4个)

### Cell的类型

TON中存在几种特殊类型的Cell：

- **普通Cell**：标准Cell
- **Pruned Branch**：被修剪的分支Cell
- **Library Cell**：库Cell，通常用于存储代码段
- **Merkle Proof**：默克尔证明Cell
- **Merkle Update**：默克尔更新Cell

### Cell在TON中的应用

1. **智能合约存储**：
   - Cell用于存储合约代码和数据
   - TON合约状态通过Cell树(Cell tree)表示
2. **区块链数据结构**：
   - 区块头、交易和消息都使用Cell编码
   - 构建默克尔树和证明
3. **消息传递**：
   - 智能合约之间的消息使用Cell编码
   - 消息体和头部都存储在Cell中
4. **序列化**：
   - 使用名为BoC(Bag of Cells)的格式序列化Cell树
   - 用于网络传输和存储

### Cell的技术优势

1. **高效存储**：通过引用结构避免重复数据
2. **默克尔树支持**：天然支持默克尔树结构，便于验证
3. **增量更新**：只需替换变化的Cell，不需要复制整个数据结构
4. **灵活性**：可以表示任意复杂的数据结构

### 开发中使用Cell

在TON开发中，通常使用专门的库处理Cell：

- FunC中通过内置方法操作Cell
- 在JavaScript中，可以使用ton-core库处理Cell

理解Cell对于深入理解TON区块链的工作原理和开发TON智能合约至关重要，因为它是整个TON生态系统数据存储和传输的基础。

## Jetton Contract

Jetton是TON区块链上的标准化代币(token)合约, 类似于evm区块链上的erc20合约？

### Jetton token的架构

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-05-19/image-20250519210341163.png" alt="image-20250519210341163" style={{ zoom: '33%' }} />

#### 1、主钱包+子钱包结构

- **Jetton Minter**：主合约（master合约)，管理代币的总供应量、元数据和铸造权限
- **Jetton Wallet**：为每个持有者创建的子钱包合约，管理个人代币余额

**master合约负责：**

- mint token
- 提供代币的基础信息 get_jetton_data
- 部署用户的jetton wallet
- 计算用户的wallet address （get_wallet_address）

**普通wallet合约负责：**

- transfer token
- burn token
- 获取wallet 余额和地址信息 get_wallet_data

每一个用户持有这个token都需要一个wallet contract 。不同的jetton token，也需要不同的wallet contract。

比如上面Alice，对于Jetton A和Jetton B，拥有不同的wallet。

## ton_proof

### 一般流程：

- 后端生成一个 ton_proof 实体，并发送给前端。
- 前端用ton wallet对其签名，发送给后端
- 后端验证签名，确认用户确实有wallet 操作权限；

### ton_proof的数据结构：

```
type TonProofItemReply = TonProofItemReplySuccess | TonProofItemReplyError;

type TonProofItemReplySuccess = {
  name: "ton_proof";
  proof: {
    timestamp: string; // 64-bit unix epoch time of the signing operation (seconds)
    domain: {
      lengthBytes: number; // AppDomain Length
      value: string;  // app domain name (as url part, without encoding)
    };
    signature: string; // base64-encoded signature
    payload: string; // payload from the request
  }
}

```

## ton的交易流程

本质上都是通过message来传递消息，交易有3种：

### 1、最简单的**普通payment**交易

```
userA =--external message--=> A Wallet Contract =--external message--=> Destination Wallet Contract => UserB
```

![image-20250519111630017](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-05-19/image-20250519111630017.png)
几个注意点：

- 用户的钱包也是一个合约
- 交易是从一个合约发送到另一个合约

### 2、jetton token的交易

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-05-19/image-20250519174128411.png" alt="image-20250519174128411" style={{ zoom: '50%' }} />

一笔交易涉及到4次合约调用

- 0 - BOB用v3的wallet，发送消息到BOB的`Jetton Wallet`
- 1 - 从`BOB`的`jetton wallet`发送一笔交易到`Alice`的`Jetton Wallet`
- 2‘ - Alice的v4 Wallet会接收到的通知；
- 2’‘ - 交易里没用完的gas（多出来的ton）会返回给BOB，也可以在构建交易时，指定Response Destionation地址；
-

message 0 的交易结构体如下：

> | Name                   | Type    | Description                                                                                                                                                            |
> | ---------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `query_id`             | uint64  | Links the three messaging types—transfer, transfer notification, and excesses—to each other. To ensure this process works correctly, **always use a unique query ID**. |
> | `amount`               | coins   | Tthe total `ton coin` amount sent with the message.                                                                                                                    |
> | `destination`          | address | The address of the new owner of the jettons                                                                                                                            |
> | `response_destination` | address | The wallet address used to return remaining Toncoin through the excesses message.                                                                                      |
