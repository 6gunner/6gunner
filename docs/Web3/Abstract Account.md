## 什么是AA?





**AA账户概念：**

为什么要有AA账户的概念：

1、AA账户的私钥管理不用担心丢失找回问题；

2、提高用户体验



L1上实现AA的困难点：

底层协议不支持，在L1层面上实现非常复杂，主要体现在：

1、EOA账户概念根深蒂固

2、EVM的限制



L2上AA的解决方案：

1、L2本身就是为了解决性能问题的

2、Starknet和ZKSync默认集成了**EIP4337**



**ERC-4337的AA账户标准有哪些东西？**

整体架构有哪些？

user => 

```
```



UserOperation： 用户的操作有哪些字段？

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendUserOperation",
  "params": [
    {
      sender, // address
      nonce, // uint256
      factory, // address
      factoryData, // bytes
      callData, // bytes
      callGasLimit, // uint256
      verificationGasLimit, // uint256
      preVerificationGas, // uint256
      maxFeePerGas, // uint256
      maxPriorityFeePerGas, // uint256
      paymaster, // address
      paymasterVerificationGasLimit, // uint256
      paymasterPostOpGasLimit, // uint256
      paymasterData, // bytes
      signature // bytes
    },
    entryPoint // address
  ]
}
```



EntryPoint定义：入口合约的接口有哪些，需要实现哪些功能

```
handleOps： 处理用户操作，（除了单个的，还可能是聚合的，这里省略了...）

validateUserOp： 验证用户的操作

创建用户的合约账户：调用AcountContract去创建用户的合约钱包；
```



Account Contract Interface: 账户合约的接口有哪些？

```
interface IAccount {
	// 需要提供一个接口来验证UserOp是否是合法的，包括不限于 userOpHash是否一直，caller是否合法，资金是否充足
  function validateUserOp
      (PackedUserOperation calldata userOp, bytes32 userOpHash, uint256 missingAccountFunds)
      external returns (uint256 validationData);
}
```



可选的-paymasters： 用来支付gas的

Client:  钱包应用，负责将用户的请求以UserOperation的结构发送过来



**Bundler**

用来收集多个UserOperation，要实现一个Bundler，需要实现下面大概几个接口给client来调用：

```
eth_sendUserOperation: 用来接收用户的操作;

eth_estimateUserOperationGas: 用来估算用户的操作gas;

eth_getUserOperationReceipt： 获取用户操作的receipt

eth_getUserOperationByHash： 传入hash，获取用户操作的详情，有点像orderId

eth_supportedEntryPoints: 返回bundler支持的entry points列表;

eth_chaind: 返回当前的chainId

```



聚合器： 可选的一个合约组件，提高交易处理的效率。一般是entrypointer合约会去调用它来批量处理交易；

交易内存池：

打包交易：



**基本原理**

**验证的原理** 

bundler要验证UserOperate的合法性，

其中要先验证UserOp里的nonce

再验证UserOp的签名

Account执行时，也还要验证UserOp是否是合法的，包括不限于 userOpHash是否一直，caller是否合法，资金是否充足；



**EntryPoint和Account合约的交互流程**

![image-20241017152134315](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2024-10-17/image-20241017152134315.png)





**首次AA账户的创建时机？创建原理**

利用create2来计算wallet address

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Create2.sol";

contract AAWalletFactory {
    function getWalletAddress(address owner, uint256 salt) public view returns (address) {
        // 计算钱包合约的初始化代码
        bytes memory initCode = abi.encodePacked(
            type(AAWallet).creationCode,
            abi.encode(owner)
        );
        
        // 使用 CREATE2 计算地址
        return Create2.computeAddress(bytes32(salt), keccak256(initCode));
    }
}

// 客户端（JavaScript）使用示例
const ethers = require('ethers');

async function getAAWalletAddress(factoryAddress, owner, salt) {
    const factory = new ethers.Contract(factoryAddress, factoryABI, provider);
    const walletAddress = await factory.getWalletAddress(owner, salt);
    return walletAddress;
}

// 使用方法
const owner = '0x1234...'; // 钱包所有者地址
const salt = ethers.utils.id('unique_identifier'); // 可以是任何唯一值
const walletAddress = await getAAWalletAddress(factoryAddress, owner, salt);
console.log('Predicted wallet address:', walletAddress);
```





**坑在哪里？**



**目前比较安全实现版本是什么？** 



**bundler是干嘛的？**

接受用户的UserOp, 然后交给EntryPointer合约上链；

实现有很多，找到了几个开源的：

- stackup-bundler（go实现）
- infinitism-bundler (ts实现)

- pimlico (ts实现 )： https://docs.pimlico.io/infra/bundler






**Account Contract**

属于一种Smart Contract，但是遵循SNIP-6（[Starknet Improvement Proposal-6: Standard Account Interface](https://github.com/ericnordelo/SNIPs/blob/feat/standard-account/SNIPS/snip-6.md)）的规范。

1、`__validate__`: Account Contract在执行交易前，会先调用`__validate__`来判断是否是合法的。

2、`__execute__`: Account Contract真正执行交易用`__execute__`。

3、`is_valid_signature`： 是社区提议的，主要就是为了方便一些dapp的验签需求。

4、`supports_interface`: Account Contract需要用这个方法，来确定是否支持上面3个interface；



一些社区提出来的综合方法：

**`__validate_declare__`**： 允许Account Contract声明Smart Contract，

**`__validate_deploy__`**: 可以先获得合约的地址，等到真正需要合约的时候再去部署创建，节省gas。







## 带着问题

### Q1:  Starknet的AA为什么需要一个deploy  address? 











### AA钱包交易怎么进行？怎么授权的？



电路解析jwt的时候能拿到这个publicKey





