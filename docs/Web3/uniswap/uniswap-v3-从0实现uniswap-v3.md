
# 大纲：

## Milestone0. 简介

### 交易市场简介： 
大概会告诉我中心化交易所怎么运作的，去中心化交易所怎么运作，再告诉什么是自动做市商-AMM

### Constant Function Market Makers

介绍著名的公式： X * Y = K 

然后根据这个公式演变出一些价格变化的公式：

```
L = sqrt( x*y )

sqrt p = sqrt (y/x)

```

再根据演变的公式，绘制出 价格曲线 

### Uniswap v3简介
交代一下uniswapv2的问题，介绍v3的创新点；
然后介绍数学原理，再推算价格公式；
详细介绍v3里的ticks概念；


### 开发环境
帮助读者搭建一个开发环境，用来测试uniswap v3的代码

### 构建了什么

#### 合约部分

1、UniswapV3Pool  流动性池子合约，实现了流动性管理
2、UniswapV3Factory ： 注册中心合约，可以部署流动性池子合约，并且记录所有已部署的池子合约；
3、UniswapV3Manager:  周边合约，为了简化pool contract的交互。 是SwapRouter的简单实现；
4、UniswapV3Quoter:  可以计算链上swap价格的合约。
5、UniswapV3NFTManager: 将流动性token转成NFT。

## Milestone 1. 第一笔交易

### 简介

主要是介绍了如何添加流动性，流动性区间tick的设计机制；

#### tick

流动性被分为很多区间，每一个区间都有一个index，每一个区间之间差一个base（1% 再除以100）

price =  1.00001^tick

### 计算流动性

理论知识：介绍怎么计算流动性？

Q1: 用户可以设置流动性的价格区间，怎么在mint和brun的时候保证价格区间？

用户添加流动性的时候，需要指定tickLower和tickUpper, 这样就确定了用户想定价的范围；
然后系统会根据这个范围，再根据用户想要添加的流动性数量，计算需要存入两种代币的比率（具体值）

Q2: 在uniswapv3里，提供流动性时可以指定tickLower, tickUpper，但是提供流动性时又必须保持当前现货价格，这两者不是冲突了吗？

回答：没有冲突，tickLower和tickUpper决定了你提供的流动性在哪个价格范围区间里提供作用，但是你提供流动性时必要保持当前价格比例。比如你正在添加eth/usdc的流动性，设置的区间是1800~2200， 当价格低于1800时，你的流动性会被全部转化为单token-USDC；反之全部转化为ETH。但这样你就无法赚取手续费了。

**Q3: 怎么去计算这些流动性的数量？**




### 提供流动性
真正的代码实现

### 第一步交易
根据用户输入的数量，计算用户获得的数量；


## MileStone2. 第二笔交易

这里会介绍怎么自动化所有交易？支持双向交易；

### 计算输出金额
之前是计算买token-x需要多少token-y 
现在是计算卖token-x能够得到多少token-y



## MileStone3. 跨tick交易

前面的实现都只能在一个tick区间里进行交易
这里介绍了怎么在不同的区间里进行交易；


## Milestone 4. 多池子交易

目前必须先有交易池子，才能进行交易，没办法跨个池子交易。 uniswap应该允许自动路由，找到合适的交易路径的。



> 参考资料：
> https://y1cunhui.github.io/uniswapV3-book-zh-cn/docs/milestone_1/calculating-liquidity/
> 
> https://uniswapv3book.com/

