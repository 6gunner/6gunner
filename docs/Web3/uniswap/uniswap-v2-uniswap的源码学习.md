## 看资料学习

### 带着问题：

**1、搞明白这前端需要哪些和合约交互？以及分别是干嘛的？**

- UniswapV2Router: 添加，移除流动性； swap；
- Multicall：批量调用合约进行交互；

**2、uniswap-sdk里在干嘛？**

计算数据：比如增加、 移除流动性的时候需要用到

**3、为什么approve每次数量很大**

这个是他故意的，设置了uint256最大值

**4、token余额是怎么查询的？为什么有时候切换network状态不对？**

```
useCurrencyBalances => useTokenBalances => useTokenBalancesWithLoadingIndicator =>{
useMultipleContractSingleData、useSingleContractMultipleData} => useCallsData => toCallState =>
```

切换网络后，这里的balances查不到数据？

WorkBox： 缓存管理

### **一、MultiCall流程**

![uniswap v2 updater的流程](https://ipic-coda.oss-cn-beijing.aliyuncs.com/2026/01-01/uniswap%20v2%20updater%E7%9A%84%E6%B5%81%E7%A8%8B.png)

**状态管理：**

两个状态：

```ts
export interface MulticallState {
  callListeners?: {
    // on a per-chain basis
    [chainId: number]: {
      // stores for each call key the listeners' preferences
      [callKey: string]: {
        // stores how many listeners there are per each blocks per fetch preference
        [blocksPerFetch: number]: number; //
      };
    };
  };

  callResults: {
    [chainId: number]: {
      [callKey: string]: {
        data?: string | null;
        blockNumber?: number;
        fetchingBlockNumber?: number;
      };
    };
  };
}
```

**3个Reducer：**

- `multicall/addMulticallListeners`： 添加监听器
- `multicall/fetchingMulticallResults`: 获取结果
- `multicall/updateMulticallResults`: 更新结果

**Updater的功能**

updater应该是MultiCall的**最最最**核心模块了

Updater里有useEffect，监听blockerNumber的变化，然后每当blockerNumber变化的时候，会去触发hook重新执行：

依次变历所有的callListeners，执行`activeListening()`方法

> **对于`activeListening`的逻辑理解**
>
> activeListening是拿到每一个callKey的最小的blocksPerFetch；

> **`blocksPerFetch`怎么理解？**
>
> 如下，call1代表一个contract调用key，它里面存在很多对象，每一个对象的key就是代表着blocksPerFetch，1代表要求每块更新，5代表不能超过5个block;
>
> ```ts
> // 输入
> const listeners = {
> "call1": { // callkey
>  "1": 2,   // 2个监听器要求每块更新
>  "5": 1,   // 1个监听器允许5块更新
>  "0": 0    // 无效配置
> },
> "call2": {
>  "10": 1,  // 1个监听器允许10块更新
>  "20": 3   // 3个监听器允许20块更新
> }
> }
>
> // 输出listeningKeys
> {
> "call1": 1,  // 取最小值1，因为有监听器要求每块更新
> "call2": 10  // 取最小值10
> }
> ```

从activeListening里然后拿到所有listeningKeys信息，然后执行`outdatedListeningKeys`方法。

> `outdatedListeningKeys` 方法会根据区块返回“过期”（需要更新）的 keys
>
> ```ts
> export function outdatedListeningKeys(
>   callResults: AppState['multicall']['callResults'], // MulticallState里的callResults
>   listeningKeys: { [callKey: string]: number }, // 监听的 keys
>   chainId: number | undefined, // 当前的 chainId
>   latestBlockNumber: number | undefined // 当前的、最新的 blockNumber,
> ): string[] {
>   if (!chainId || !latestBlockNumber) return [];
>
>   const results = callResults[chainId];
>   // no results at all, load everything
>   // 如果没有结果，则加载所有监听的请求
>   if (!results) return Object.keys(listeningKeys);
>
>   return Object.keys(listeningKeys).filter((callKey) => {
>     const blocksPerFetch = listeningKeys[callKey];
>
>     const data = callResults[chainId][callKey];
>     // no data, must fetch
>     if (!data) return true; // 情况1: 没有数据
>
>     // 计算应该在多少区块更新数据，如果上次fetchingBlockNumber大于这个区块，则不更新
>     const minDataBlockNumber = latestBlockNumber - (blocksPerFetch - 1);
>
>     // already fetching it for a recent enough block, don't refetch it
>     if (
>       data.fetchingBlockNumber &&
>       data.fetchingBlockNumber >= minDataBlockNumber
>     )
>       return false;
>
>     // if data is older than minDataBlockNumber, fetch it
>     return !data.blockNumber || data.blockNumber < minDataBlockNumber;
>   });
> }
> ```

找到`当前blockNumber`下需要更新的callKeys。然后对这些callKeys进行`sort`并且`stringify`。（这一步主要是为了生成key， 避免重复触发useEffect）

最后在一个`useEffect`的 hook 里，将这些serializedOutdatedCallKeys进行分组，

```ts
useEffect(() => {
  if (!latestBlockNumber || !chainId || !multicallContract) return;
  // parse
  const outdatedCallKeys: string[] = JSON.parse(serializedOutdatedCallKeys);
  if (outdatedCallKeys.length === 0) return;
  const calls = outdatedCallKeys.map((key) => parseCallKey(key));

  // 将calls[]分块成二维数组，每一个数组最多500个，避免单个请求太大
  const chunkedCalls = chunkArray(calls, CALL_CHUNK_SIZE);

  // 如果当前的blockNumber和上次不一样，则取消上次请求
  if (cancellations.current?.blockNumber !== latestBlockNumber) {
    cancellations.current?.cancellations?.forEach((c) => c());
  }

  // 更新状态为"正在获取":
  dispatch(
    fetchingMulticallResults({
      calls,
      chainId,
      fetchingBlockNumber: latestBlockNumber,
    })
  );

  cancellations.current = {
    blockNumber: latestBlockNumber,
    cancellations: chunkedCalls.map((chunk, index) => {
      // 创建一个可取消的请求
      const { cancel, promise } = retry(
        () => fetchChunk(multicallContract, chunk, latestBlockNumber),
        {
          n: Infinity,
          minWait: 2500,
          maxWait: 3500,
        }
      );
      // 处理请求结果
      promise
        .then(({ results: returnData, blockNumber: fetchBlockNumber }) => {
          // 请求成功，那么取消函数可以被删除
          cancellations.current = {
            cancellations: [],
            blockNumber: latestBlockNumber,
          };

          // accumulates the length of all previous indices
          // 计算当前chunk的索引范围
          const firstCallKeyIndex = chunkedCalls
            .slice(0, index)
            .reduce<number>((memo, curr) => memo + curr.length, 0);
          const lastCallKeyIndex = firstCallKeyIndex + returnData.length;

          // 触发updateMulticallResults state更新
          // debugger;
          dispatch(
            updateMulticallResults({
              chainId,
              results: outdatedCallKeys
                .slice(firstCallKeyIndex, lastCallKeyIndex)
                .reduce<{
                  [callKey: string]: string | null;
                }>((memo, callKey, i) => {
                  memo[callKey] = returnData[i] ?? null;
                  return memo;
                }, {}),
              blockNumber: fetchBlockNumber,
            })
          );
        })
        .catch((error: any) => {
          if (error instanceof CancelledError) {
            console.debug('Cancelled fetch for blockNumber', latestBlockNumber);
            return;
          }
          console.error(
            'Failed to fetch multicall chunk',
            chunk,
            chainId,
            error
          );
          dispatch(
            errorFetchingMulticallResults({
              calls: chunk,
              chainId,
              fetchingBlockNumber: latestBlockNumber,
            })
          );
        });

      // 返回取消函数
      return cancel;
    }),
  };
}, [
  chainId,
  multicallContract,
  dispatch,
  serializedOutdatedCallKeys,
  latestBlockNumber,
]);
```

fetchChunk（这里其实就是真正的调用multicall合约的aggregate方法）。

fetch成功后，会调用updateMulticallResults reducer，更新 callResults ;

**hooks 如何拿到想要的 state 的？**

有三个 multicall 相关的 hook，针对三种不同的交易场景：

- useSingleContractMultipleData 同一个合约，用不同参数，多次调用不同的方法；eg: 同时查询一个token的name，symbol，decimal等信息
- useMultiContractSingleData:不同合约，调用同一个方法； eg: 查询多个token的地址，调用多个pool的reverse；
- useSingleCallResult:单个合约，调用单个方法

里面的实现机制都是大同小异的：

先将参数组装成 Call对象
再调用useCallsData hook来获取CallResult
useCallsData 里面会去调用addMulticallListeners的 reducer，然后就进入了上面说到的 MultiCall流程里；
会有 Updater机制会去更新 state 里的 callResults。
拿到 CallResult 后，再将结果转化为CallState。

### 二、监听交易（WatchingTransaction）

transaction namespace下有这么几个状态：

```ts
export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: {
      hash: string;
      approval?: { tokenAddress: string; spender: string };
      summary?: string;
      receipt?: SerializableTransactionReceipt;
      lastCheckedBlockNumber?: number;
      addedTime: number;
      confirmedTime?: number;
      from: string;
    };
  };
}
```

reducers有这么几种：

- 交易创建成功后，先触发addTransactikon；
- 在updater里监听每一个block变化，都会去检查一遍transaction列表里里的交易，触发checkedTransaction，
- 如果交易确认了，触发finalizeTransaction;；

add时看state的diff

```ts
// 用txHash做key
0x7c959e2c6e46163ee2ef6b38e2cfeae6e2c877f043db543add6dceaf541c0fde: {
  "hash": "0x7c959e2c6e46163ee2ef6b38e2cfeae6e2c877f043db543add6dceaf541c0fde",
  "approval": {
    "tokenAddress": "0xC85183c701bF1f857D227F4e52a045C169947639",
    "spender": "0xDa0571e95D332F2CF5dffB21a4Ae3F0ECCB11f9d"
  },
  "summary": "Approve CCC",
  "from": "0x9AC7421Bb573cB84709764D0D8AB1cE759416496",
  "addedTime": 1730356114392
}
```

finalize时state的diff

```ts
0xc723e6c3808913b39d2aa1bee6476b2adf9b1536c1fea077bd8d5548e35fcc1c:{
  confirmedTime: 1730356547505
  receipt: {
    "blockHash": "0x530898dcab2993bc2dcddad00f83a79dcfc2c9c187ccacf16e293ea1c5098c6e",
    "blockNumber": 199243,
    "contractAddress": null,
    "from": "0x9AC7421Bb573cB84709764D0D8AB1cE759416496",
    "status": 1,
    "to": "0xDa0571e95D332F2CF5dffB21a4Ae3F0ECCB11f9d",
    "transactionHash": "0xc723e6c3808913b39d2aa1bee6476b2adf9b1536c1fea077bd8d5548e35fcc1c",
    "transactionIndex": 0
  }
}
```

### 三、**token list的获取和自定义token的添加：**

- 在CurrencySearch组件里输入地址，触发useToken 这个自定义hook
- 查询到合约信息，点击Add 按钮，触发`user/addSerializedToken`
- 向tokens里添加一个token;

### **四、添加流动性的逻辑：**

usePairs: 将两个token按地址进行比较，然后排序，然后用create2生成地址；

```ts
public static getAddress(tokenA: Token, tokenB: Token): string {
    const tokens: [Token, Token] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

    if (PAIR_ADDRESS_CACHE?.[tokens[0].address]?.[tokens[1].address] === undefined) {
      PAIR_ADDRESS_CACHE = {
        ...PAIR_ADDRESS_CACHE,
        [tokens[0].address]: {
          ...PAIR_ADDRESS_CACHE?.[tokens[0].address],
          // 使用以太坊的 CREATE2 操作码的规则来确定性地生成新地址：
          [tokens[1].address]: getCreate2Address(
            FACTORY_ADDRESS,
            // 对两个代币地址进行哈希运算，
            keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]),
            // 部署合约的初始化代码的哈希
            INIT_CODE_HASH,
          ),
        },
      }
    }

    return PAIR_ADDRESS_CACHE[tokens[0].address][tokens[1].address]
  }
```

wrappedCurrency: 交互逻辑，用来包裹我们的NativeCurrency

LP的mint

```
PancakeSwap Factory
```

**LP的数量计算：**

```
首次提供流动性：

流动性代币数量 = √(token0数量 * token1数量)


非首次提供：

流动性代币数量 = min(token0数量 * 总供应量 / reserve0, token1数量 * 总供应量 / reserve1)
```

`IUniswapV2PairABI.getReserves`:获取token pair的流动性池子余额

**Pancake LPs (Cake-LP)**

添加流动性后，合约会给流动性提供者mint token。

### 移除流动性：

三种模式：百分比，销毁LP token余额，直接告诉修改token的数量；

### 自动计算交易链路：

useDerivedSwapInfo的思路是什么？

- 首先获取"基础代币"列表，通常包括 WETH、USDC、USDT、DAI 等主要代币。这些是流动性最好的代币。

- 生成所有可能的交易对组合:

```ts
const allPairCombinations: [Token, Token][] = [
  // 直接交易对
  [tokenA, tokenB], // 例如：[WETH, USDC]

  // tokenA 与所有基础代币的组合
  ...bases.map((base) => [tokenA, base]),
  // 例如：[WETH, USDT], [WETH, DAI]

  // tokenB 与所有基础代币的组合
  ...bases.map((base) => [tokenB, base]),
  // 例如：[USDC, USDT], [USDC, DAI]

  // 所有基础代币之间的组合
  ...basePairs,
  // 例如：[USDT, DAI], [USDT, WBTC]
];
```

举例说明:

如果你要用 ETH 换 USDC，假设基础代币列表是 [WETH, USDC, USDT, DAI]，它会生成这些路径：

```
直接路径：

- ETH -> USDC

单跳路径（通过基础代币）：

- ETH -> USDT -> USDC

- ETH -> DAI -> USDC

- ETH -> WBTC -> USDC

多跳路径（通过基础代币组合）：

- ETH -> USDT -> DAI -> USDC

- ETH -> DAI -> USDT -> USDC

等等...
```

- 过滤无效和重复的交易对:

```
.filter(([t0, t1]) => t0.address !== t1.address)  // 过滤掉相同代币的交易对
.filter(([tokenA, tokenB]) => {
  // 使用 CUSTOM_BASES 进行额外的路径过滤
  // 某些代币可能有特定的交易路径限制
})
```

- 检查交易对是否存在:

```
const allPairs = usePairs(allPairCombinations)
```

- 最后检查这些交易对在 Uniswap 上是否真实存在（有流动性）。

这样就能找到所有可能的交易路径，然后 Trade.bestTradeExactIn 会计算每条路径的输出金额，选择最优的路径。

### 用户settings配置

**滑点计算：**

根据滑点比例，计算最多交易的数量；

**交易池算法计算：**

遍历交易池，计算哪个交易路线的成本最低；

### swap的数量怎么计算？

都是用恒定公式 `x * y  = k` 来推导的
假设我们要用x来换y（支付x, 得到y）

$$
(x + Δx)(y - Δy) = k
$$

经过推导，可以知道。

$$
Δy = Δx * y / (x + Δx)
$$

假如需要手续费f，那么

$$
Δy = Δx * (1-f) * y / (x + Δx * (1 -f))
$$

### 最大卖出数量

如果用户是输入Sell输入框的，那么

$$
最大卖出数量 =  (1 + allowedSlippage) * Δx
$$

### 最小得到数量怎么计算的？

$$
最小得到数量 = (1 - allowedSlippage) * Δy
$$

### Price Impact是怎么计算的？

为什么价格影响的公式是：Price Impact = (Pspot - Pexecution)/Pspot？

经济基础知识：(初始价格 - 最终价格)/初始价格

- 如果 Pspot = 100, Pexecution = 95
- Price Impact = (100-95)/100 = 5%
- 表示价格因为这笔交易下降了5%

这比直接用价格差（Pspot - Pexecution）更有意义，因为它表示的是相对变化。

最后推导得出：

```
Price Impact = Δx/(x + Δx)
```

### 向router合约发起交易

swap namespace里初始状态里有这些状态：

```ts
const initialState: SwapState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: '',
  },
  [Field.OUTPUT]: {
    currencyId: '',
  },
  recipient: null,
};
```

选择token后，会对应修改[Field.INPUT]/[Field.OUTPUT];

然后输入value，会触发`swap/typeInput` ，更新state

<img src="https://ipic-coda.oss-cn-beijing.aliyuncs.com/2026/01-01/image-20241031141132748.png" alt="image-20241031141132748" style={{ zoom: '50%' }} />

然后useDerivedSwapInfo里会重新计算Trade

之后会根据Input的currencyId是native token还是erc20 token, 来展示`Approve Button`或`Swap Button`

之后就是Approve Token和Swap的流程逻辑了；

### 获取Approve Token的状态

先去链上查询 approve的allowance，

再去transaction list里查询正在监听的交易列表，看看有没有正在pending的approve交易；

如果有allowance，且allowance满足要求，那么认为授权完成；

如果allowance不满足要求，但是有pending的交易，那么返回pending状态；

如果allowance不满足要求，也无pending的交易，那么返回NOT_APPROVED；
