## the-graph

在写uniswap相关项目时，用到了一些数据信息，是通过the-graph来进行查询；

这里一个想记录下怎么用react-apollo来进行the graph服务查询；

另一个想研究下v2和v3的swap里到底有哪些接口？



### 一、react里apollo的使用

项目里主要是用到了`@apollo/client` + `graphql`这2个库，



#### 1、创建apolloClient对象

```ts
const blockClient = new ApolloClient({
  uri: 'https://thegraph-subgraphs-testnet.expchain.ai/subgraphs/name/blocklytics/exp-testnet-blocks',
  cache: new InMemoryCache()
})
```



#### 2、声明gql查询语句

这里写了一个简单的查询block height的语句

```ts
const GET_BLOCK  = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1,
      orderBy: timestamp,
      orderDirection: asc,
      where: {
        timestamp_gte: $timestampFrom,
        timestamp_lte: $timestampTo
      }
    ) {
      id
      number
      timestamp
    }
  }
`
```





#### 3、调用client.query方法查询

**参数：**

- query: 上面的hql语句
- variables: 假如hql的查询时，如果有定义参数，那这里就需要给值，对应你定义的变量名字
- fetchPolicy: 可以定义一些缓存策略，// todo 待研究

```ts
const utcCurrentTime = dayjs();
const utcOneDayAgo = utcCurrentTime.subtract(1, 'day').startOf('minute').unix();
// 查询1天前的区块
const result = await blockClient.query({
  query: GET_BLOCK,
  variables: {
    timestampFrom: utcOneDayAgo,
    timestampTo: utcOneDayAgo+ 600,
  },
  fetchPolicy: 'network-only'
})
```



#### 4、总结

graphql的调用主要就是要根据schema定义好gql语句，然后调用client进行查询。

client可以提前new出来：

- 然后可以通过context.provider来设置进去，使用时通过context获取；

- 也可以存放在一个公共的地方，然后import进来；



### 二、v2 the graph有啥接口？

这里我们分析v2-info的代码来看



#### 2.0 v2的entities类型

选了几个重要且比较有代表性的（其他的不是不重要）

##### a、Token类型

token对象里存储整个uniswap所有交易币对里的token。

```ts
id
symbol
name
decimals
tradeVolume
tradeVolumeUSD： 代表所有交易总量（一些token pair流动性没超过threshold,所以没统计进去）
untrackedVolumeUSD: 所有流动性都算在里面了，累计的交易总量
```



##### b、Pair类型

```ts
id
factory: UniswapFactory
token0
token1
trackedReserveETH	
token0Price: 每单位token1需要多少token0
token1Price: 每单位token0需要多少token1
volumeUSD: swap的交易总额（liquidity超过threshold的累计 ）
untrackedVolumeUSD： swap的交易总额（无论liquidity是否超过threshold，都累计进去）

```



#### 2.1 `liquidityPositionSnapshots`

作用：查询用户的历史`liquidityPosition`快照， 可以绘制用户持仓的变化情况

```ts
  query snapshots($user: Bytes!, $skip: Int!) {
    liquidityPositionSnapshots(first: 1000, skip: $skip, where: {user: $user}) {
      timestamp
      liquidityTokenBalance
      liquidityTokenTotalSupply
      reserve0
      reserve1
      pair {
        id
        token0 {
          id
        }
        token1 {
          id
        }
        reserve0
        reserve1
      }
    }
  }
```





#### 2.2 `liquidityPositions`

作用：查询用户当前的liquidityPosition

```ts
const USER_POSITION = gql`
  query position($user: Bytes!) {
    liquidityPositions(where: {user: $user}) {
      liquidityTokenBalance
      pair {
        id
        token0 {
          id
          symbol

        }
        token1 {
          id
          symbol

        }
        reserve0
        reserve1
      }
    }
  }
`
```



#### 2.3 Transaction

查询用户的交易记录

```ts
export const USER_TX_HISTORY = gql`
  query transactions($user: Bytes!) {
  	// 添加流动性
    mints(orderBy: timestamp, orderDirection: desc, where: {to: $user}) {
      id
      timestamp
      pair {
        id
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    // swap token
    swaps(orderBy: timestamp, orderDirection: desc, where: {to: $user}) {
      id
      timestamp
      pair {
        id
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
    // 移除流动性
    burns(orderBy: timestamp, orderDirection: desc, where: {to: $user}) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
  }
`;
```



#### 2.4 查询所有的token pairs

可以分页查询所有的token pair

```ts
const ALL_TOKEN_PAIRS = gql`
  query AllTokenPairs($skip: Int, $first: Int, $orderBy: Pair_orderBy, $orderDirection: OrderDirection) {
    pairs(skip: $skip, first: $first, orderBy: $orderBy, orderDirection: $orderDirection, block: $block) {   
      id
      token0 {
        symbol
        name
        decimals
      }
      token1 {
        symbol
        name
        decimals
      }
      reserve0
      reserve1
      txCount
      totalSupply
      liquidityPositions {
        id
        liquidityTokenBalance
      }
    }
  }
`;
```

其中liquidityPositions是一个数组，id的格式形如：

```
0x47d625cd0ceb0322f880011cde8fea0238e6db11-0x7d5dbf0e1738c5ff7a9c245d4665422632869800
```

前面一部分是lp token的合约地址，后面一部分是LP持有者的钱包地址；





### 三、自动ts类型生成

apollo提供了codegen工具，可以根据the graph的schema，生成对应的ts类型；

#### 3.1 需要安装的依赖

```
    "@graphql-codegen/cli": "^5.0.3",
    "@graphql-codegen/typescript": "^4.1.2",
    "@graphql-codegen/typescript-operations": "^4.4.0",
    "@graphql-codegen/typescript-react-apollo": "^4.3.2",
```



#### 3.2 codegen的配置文件

```yaml
overwrite: true
schema: "https://thegraph-subgraphs-testnet.expchain.ai/subgraphs/name/sugar-finance-v2-testnet"
documents: "src/graphql/sugar-finance/**/*.ts"
generates:
  src/generated/graphql.ts:
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-react-apollo"

```



#### 3.3 生成命令

```
"scripts": {
	"codegen": "graphql-codegen --config codegen.yml"
}
```



