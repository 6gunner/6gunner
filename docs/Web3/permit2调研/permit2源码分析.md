## 5、代码实现分析：Permit2 授权 Transfer



### 5.1 源码：`src/signatureTransfer.ts`

我是从test入口来分析的，所有首先看到的就是这个signatureTransfer.ts。

testcase1是验证`SignatureTransfer.hash`方法不会throw error。 

SignatureTransfer.hash的API如下：

```ts
/**
   * 计算permit的hash值
   * @param permit // 重要类型1
   * @param permit2Address // 合约地址
   * @param chainId // 链id
   * @param witness // 见证人
   * @returns
   */
  public static hash(
    permit: PermitTransferFrom | PermitBatchTransferFrom,
    permit2Address: string,
    chainId: number,
    witness?: Witness
  ): string {
    // 重要方法1
    const { domain, types, values } = SignatureTransfer.getPermitData(permit, permit2Address, chainId, witness)
    // eip-712 拿到domain，types，values进行签名
    return _TypedDataEncoder.hash(domain, types, values)
  }
}
```



其中permit是一个比较核心的类型，`SignatureTransfer.getPermitData`是另一个static方法，会将用户的参数转化成eip712需要的参数；



#### 5.1.1 permit 类型数据结构

可以是单笔PermitTransferFrom，也可以是批量的PermitBatchTransferFrom（批量请求的spender需要是同一个人，也就是说可以是将同一个spender的不同token一次性批量授权transfer）

```
export interface PermitTransferFrom {
  permitted: TokenPermissions
  spender: string
  nonce: BigNumberish
  deadline: BigNumberish
}

export interface PermitBatchTransferFrom {
  permitted: TokenPermissions[]
  spender: string
  nonce: BigNumberish
  deadline: BigNumberish
}

export interface TokenPermissions {
  token: string // 合约地址
  amount: BigNumberish
}
```



#### 5.1.2 `getPermitData` 做了什么？

主要是返回EIP712-domain signaure需要的一些数据类型

- domain： 

  ```
  {
    name: PERMIT2_DOMAIN_NAME,
    chainId,
    verifyingContract: permit2Address,
  } 
  ```

- types: 这个和values要一一对应，主要是分batch、非batch，witness、非witness。

  有witness的可以理解为业务上需要一些自定义的字段，在permit2核心逻辑上没啥影响；

  举一个PermitBatchWitnessTransferFrom的例子，其他的类型其实大同小异

  ```ts
  const TOKEN_PERMISSIONS = [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ]
  
  return {
      PermitBatchWitnessTransferFrom: [
        { name: 'permitted', type: 'TokenPermissions[]' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'witness', type: 'MockWitness' },
      ],
      TokenPermissions: TOKEN_PERMISSIONS,
      MockWitness: [{ name: 'mock', type: 'uint256' }]
    }
  
  ```

- values： 这个和types要一一对应，按上面的例子，values格式如下  (简单分析可知，只需要按PermitBatchWitnessTransferFrom里声明的属性提供value即可)

  ```ts
  {
    permitted: [
      {
        token: '0x0000000000000000000000000000000000000000',
        amount: '0',
      },
    ],
    spender: '0x0000000000000000000000000000000000000000',
    nonce: '0',
    deadline: '0',
    witness: { mock: '0x0000000000000000000000000000000000000000000000000000000000000000' },
  }
  ```

  

### 5.2 `src/allowanceTransfer.ts`

`signatureTransfer.test.ts` 里只对 `signatureTransfer.hash` 方法写了一些 testcase，然后上面分析过，hash 方法只是提供了 EIP-712 domain 签名需要的参数，然后进行了 hash 运算。这里来看下 `allowanceTransfer.test.ts`。


#### 5.2.1 hash 方法

通过对代码的分析，发现这个testcase也只是对hash方法写了testcase，api都差不多

```ts
  public static hash(permit: PermitSingle | PermitBatch, permit2Address: string, chainId: number): string {
    const { domain, types, values } = AllowanceTransfer.getPermitData(permit, permit2Address, chainId)
    return _TypedDataEncoder.hash(domain, types, values)
  }
```



#### 5.2.2 分析 PermitSingle 对象

```ts
export interface PermitSingle {
  details: PermitDetails
  spender: string
  sigDeadline: BigNumberish
}

export interface PermitDetails {
  token: string
  amount: BigNumberish
  expiration: BigNumberish
  nonce: BigNumberish
}
```



#### 5.2.3 domain types 定义

```ts
const PERMIT_DETAILS = [
  { name: 'token', type: 'address' },
  { name: 'amount', type: 'uint160' },
  { name: 'expiration', type: 'uint48' },
  { name: 'nonce', type: 'uint48' },
]

const PERMIT_TYPES = {
  PermitSingle: [
    { name: 'details', type: 'PermitDetails' },
    { name: 'spender', type: 'address' },
    { name: 'sigDeadline', type: 'uint256' },
  ],
  PermitDetails: PERMIT_DETAILS,
}
```



对应的 Permit value的数据结构：

```
{
  details: {
    token: "0x0000000000000000000000000000000000000000",
    amount: "1461501637330902918203684832716283019655932542975",
    expiration: "281474976710655",
    nonce: "281474976710655",
  },
  spender: "0x0000000000000000000000000000000000000000",
  sigDeadline: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
}
```





