参考了这个文章[在多链上部署UniswapV2](https://hhe.ink/post/%E5%B0%86UniswapV2%E9%83%A8%E7%BD%B2%E5%88%B0%E6%89%80%E6%9C%89%E5%8C%BA%E5%9D%97%E9%93%BE-%E5%8E%BB%E4%B8%AD%E5%BF%83%E5%8C%96%E4%BA%A4%E6%98%93%E6%89%80Uniswap%E5%A4%9A%E9%93%BE%E9%83%A8%E7%BD%B2%2Findex)

**按文档走完遇到的问题**

- 界面无法点击： react-over-layer问题
- - react-scripts版本太低了： dev环境需要换成vite
- 代码版本太低了，很多lib不再维护，难以修改；

解决：
- 改一个依赖库重新发版，重构成monorepo形式；
- 换成 vite 搭建项目

## 前端搭建

用monorepo搭建了一个项目：
- interface用的2020.9.1版本的（tag-2.6.4）
- sdk用的v2-sdk的2020.8.6版本的
旧版的sdk repo: https://github.com/Uniswap/v2-sdk?tab=readme-ov-file


## 合约的部署

### Exp-chain的合约地址：
```
PandraFactory: 0xE25b1E9d9d9C8455B3C57e326EDE511A47AD0778

initCodeHash: 0x2f2e23b45c93c6b0cce5208c20c256210bda31324a5ebb4ebe635d00e4e662b7 //sdk/constant

PandraRouter: 0xE0CbE406C738608085F5DB9118A47798A5E37E8d  //web/src/constants

// web/src/constants/multicall/index.ts
Multicall: 0x7406c4F36c0DCc3E3FC8cC1b1F9771DaFF3CE5d0 
```

### 一些erc20 token的地址：

```
WZKJ:0x46F2038afa5CDD1a8CD444DB923279ADe1208a48 // sdk/src/entities/token.ts
// expTokenList
expUSDT: 0xdE5A357530aFaf219628e35af91E15DF94449547 // 精度18
exPEPE: 0x71528d106F5D971e22e6f8b7EE82B5C51F0C67Cd  
exPNUT: 0xB167d64E8aFDe6b08FE411FbC34E2a4c90e2bF10  
REX: 0xC43F8a87ab9EFcbB56E21627B7c3B7F08f92dca8
```


### Sepolia网络的

合约地址：

```
Multicall: 0x2Bb71a1B7ed94bE82b31113751e8D0AdE5989236
FACTORY_ADDRESS: 0xe894843363a806d6f68f2c7801991a626fecb4f0
initCode：0x1892ee6b3b8f653471529d0b06a772bdc5588bb0b15607cb427c8148f70004a9
Router: 0xbc7690e93616d2fB455D97f96e765B8CC79706C9 // swap router

token list
WETH: 0xe43116735da929d6aa66705f6f9a08d6722755e1
USDT:0xef970b95d4b6191e603ac8bb9bb3ce2a6ef8801a
ZK：0xf6B92eE0935C8F8e9A78E6bFA40bC4E703600e1A
TOKEN: 0x668E8a7acd69496B8E48e8918Ab42bf3f134ee74

```



LP-name

全局替换掉，目前是
```
symbol: SugarFinance-LP
name: SugarFinance LPs
```

## the graph

有两个 graph 需要部署，一个是监听 uni-swap 事件的，一个是监听 block updater 事件的。

代码分别是：`/Users/keyang/Workspace/p-wkspace-uniswap/sugar-finance-v2-subgraph`, 
`/Users/keyang/Workspace/p-wkspace-uniswap/blocks-subgraph`;

我部署在the graph里监听sepolia网络的 endpoint：
client: https://api.studio.thegraph.com/query/23553/uniswap-v-2/version/latest
block-client: https://api.studio.thegraph.com/query/23553/sepolia-blocks/version/latest

前端里需要替换的代码是：

```
// web/src/apollo/queries.ts
subgraphName: "sugar-finance-v2-testnet"

// 记得每次重新部署the graph的时候，更新这个值
export const MIN_BLOCK = 63299; 否则会出现error: 

"Failed to decode `block.number` value: `subgraph QmdfMEZ4G8A2XCof4kkoBsqEm7GjC9yMS8m6eTmyVWyw6j only has data starting at block number 6939999 and data for block number 63299 is therefore not available`"

```


## 参考文档：

学习资料：https://github.com/Dapp-Learning-DAO/Dapp-Learning/blob/main/defi/Uniswap-V2/readme.md










