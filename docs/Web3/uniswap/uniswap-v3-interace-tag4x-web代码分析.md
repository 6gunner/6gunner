# 现成的代码测试

## 4.270.7版本

### 1、启动准备

- 生成token list的 schema  `yarn run ajv` 
- 


```
在celo网测试：https://docs.uniswap.org/contracts/v3/reference/deployments/celo-deployments

自定义token地址：
  coda: 0x96d2AeAa306912A256CB0F40A0b6f4245fb3b8E0
```



### 合约分析

- UniswapV3SwapRouter (封装后的交易合約)  是从`@uniswap/universal-router-sdk`里拿的`UNIVERSAL_ROUTER_ADDRESS`，
- NonfungiblePositionManager ( 用来增加/移除/修改 Pool 的流动性) 从`@uniswap/sdk-core`引入的`NONFUNGIBLE_POSITION_MANAGER_ADDRESSES`



### 后台服务部署

这个版本的价格查询需要用到[routing-api](https://github.com/Uniswap/routing-api)，有点过于麻烦了



## v4.12.18版本

### 带着问题

> Q1: 想用v4.12.18 - why? 
> A1:因为想看这个版本交互的合约哪些。
>
> Q2: 合约是不是都一样？会不会用到universalRouter之类的合约；
> 回答：这个版本不会，这个版本用的是swap router；universal-router是比较新的，替代了swap router02
>
> Q3: 怎么把yarn.lock转化成pnpm-lock.yaml？
> A: 现将yarn.lcok转化成package-lock.json.
> `$ synp --source-file yarn.lock`
> 然后将用`pnpm import`自动将package-lock.json转化成`pnpm-lock.yaml`
>
> Q4: 翻译文件怎么使用？
>
> package.json里加了两个命令：
>
> ```
> "i18n:extract": "lingui extract --locale en-US",
> "i18n:compile": "lingui compile"
> ```
>
> extract会将代码里的语言包都抽取成po，
>
> compile会将po文件生成cjs格式的代码；
>
> 默认代码里import的是`.po`文件，我手动改成引入js文件，这样就不需要引入plugin了。
>
> 默认compile出来的格式是cjs，我改成ts模式
>
> ```
>   compileNamespace: 'ts',
> ```








### 自定义合约地址 （v4.12.18）

```
chain: exp chain 
chainId: 18880
{

  "SugarFinanceV3Factory": "0xBacaDb9050145D2a7cB995C98b509C00010cd09F", // 用到了
  "swap-router": "0x56780D47961f52A9C3EF36369448d18AfAF7aeDc",
  "NFTDescriptor": "0x26DAdD0aa2Cb41854C99356FDB2F4f743e091edf",
  "tokenPositionDescriptor": "0x98da3E990c7273B9ed1224b487C41bb8F8163513",
  "positionManager": "0xD6b0502f35b0C3cfeD4709e52FDE14f1F55ab77C", // 用到了
  "quoterV2": "0x4783052db52416FfA77c147fC278934F2280e346", // 用到了
  "quoter": "0xDBa204DD65a2cC68B879cCC73e2698c2330f0AEB",
  "SugarFinanceInterfaceMulticall": "0xF8237C1F1E85D81d250D443c450Fe1e768eFfa37", // 用到了
  "tickLens": "0xE9533b8aDe96A8733c6BaC59E4fCCe6a917F614C", // 用到了
  "swapRouter02": "0xc0E13ED4ED210d50B2219d67924FA09d1B98Bbd1", // 用到了
  "UniversalRouter": "0x9cDf55a296Bb053383Fc9AC021652FE05f38E0cA",
	"Permit2": "0x6fc4158f13cd7e31B5E73eD9962381bA1498a4eF"
}

"PoolInitHash": "0xaf2027b347a2e455de123f157459d3195e36b152c98ac4a25cabfe562a7ba6f6", // 用到了
```



### 合约作用分析


- UniswapV3Factory (用来创建Pool 的合约) ，定义在v3-sdk/src/constants , sdk-core里

- `POOL_INIT_CODE_HASH`，定义在v3-sdk/src/constants 里，和UniswapV3Factory有关。

  ```
  export const POOL_INIT_CODE_HASH_TEXPchain = '0xcaec83b14061c60c3daaae5a3f03ec024be3071b5ba8595d01fc46c97f3e73b1'
  ```

  

- NonfungibleTokenPositionDescriptor (NFT 倉位描述合約)

- NFTDescriptor (NFT 描述合約)

- uniswapInterfaceMulticall： 新版的multicall合约 ，地址定义在src/constants/addresses.ts







## v3 视频流程分析笔记：

### 一、交易上的不同

##### 交易滑点：

根据交易模式设置不同的max paligation 

v2，v3设置的最大是0.5%

layer2模式的滑点容忍度可以设置的比较低 0.1%

##### 交易的价格查询：

v2使用`xy=k`的计算公式来算的

v3需要调用Quoter合约查询，通过设置callback函数，然后回调函里会通过revert error，返回预计的交易量信息；

**需要具体详细分析：**

```
用户输入交易数量 => state变化，react重新执行hook(useBestV3TradeExactIn) => 调用quoter合约
```



##### 交易对流动性的影响

在你的流动性区间里，如果价格超出了你设置的最大最小区间，那么就会你的流动性就会变成单一token。

##### 限价单的原理

设置一个很窄的价格区间，然后在这区间里，你的流动性token会被全部转化为另一种token



### 二、流动性的不同

LP token不同，v3的Lp token是一个erc721 token。

通过Manager合约的balanceOf查到的是代表你有多少个position。

在拿到tokenId，才能通过position getter方法，知道你的LP究竟注入了多少token。



#### 2.2 LP里CollectFee的查询

通过callStatic方法，调用manager的collect函数，从而的到最新的手续费收益；



#### 2.3 添加流动性

初始化流动性时，可以设置3个不同的费率等级tickerSpace ，分别应对不同的tiker。比如1%的流动性费一般应对一些山寨币对，因为他们价格变化很快。

**不同的费率等级对应的合约不一样。** todo



**添加的细节不同**

v3需要设置流动性的初始化价格





### 三、Multicall的区别

v3里增加一个方法，允许multicall里的call可以失败，因为uniswap v3有一些合约方法是查询价格的，必然需要失败的。



#### ethers.callStatic底层实际上什么？

底层是用`eth_call`来预验证交易，如果这一步失败了，交易肯定会revert。

我们在预估gas的时候，一般会调用`eth_estimateGas` RPC，这一步里面其实就会调用`eth_call`来与验证交易；









### 四、graph query

v3的代码里主要有2个地方用到了

一个是添加流动性时，需要查询，用来计算整个流动性区间的深度图。



### 五、代码分析



swap交易： 用户地址=>UniversalRouter

useBestV3Tradexxx调用quoter合约，拿到revert的返回信息；



useAllV3Routes计算uniswap v3的交易链路


添加流动性：用户交互=> NonfungiblePositionManager

创建不同区间的流动性，用户将token转出，NonfungiblePositionManager给用户mint `UNI-V3-POS(nft721)


添加流动性时，v2是用`factoryAddress`, `tokenAddress`, `initCodeHash`计算pair的地址；v3类似，



#### 5.4 usePoolInfo + useV3PositionsForTokenInfo

查询position列表

利用ehter.callStatic方法调用poolInfo上的合约方法



5.2.1 添加流动性

usev3DerivedMintInfo 

