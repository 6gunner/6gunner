

截至 2021 年 6 月，uniswap已经出到了v3版本。

v1版本只支持erc20-token和eth进行兑换。



## Uniswap-v1的经济模型

### 自动做市商 - Automated Market Maker

AAM是去中心化交易所里不可或缺的一部分，它不像传统中心化交易所里只能有固定的做市商来提供流动性，而是允许任何人来提供流动性。

AMM设计了一个 流动性池子`liquidity pools `，任何人可以向池子里面存入token里提供流动性。



AMM是一个统一的术语，可能包含不同的做市商算法。

AMM的3个主流模型：

- Uniswap： 开创性的，让用户50/50 的比例，向`liquidity pool`里提供任意一个币对的token。
- Curve：//todo
- Balancer: //todo



### Constant Product Formula (恒定的乘积)

uniswap是AMM最受欢迎的算法之一，它的核心计算公式就是： `x * y = k`

```shell
x  = ether 剩余的数量
y = token剩余的数量
k = 一个固定值
```

理论上无论x、y的数量怎么变化，他们的乘积都是固定的。



根据这个公式，可以得知：假设流动性池里有ETH、Dai两种币，ETH的数量越多，Dai的数量就会越少，Dai价格就会越高。

相反，Eth的数量越少，Dai的数量越多，Dai的价格会越低。

整个流动性池里的ETH的价值和Dai的价值会保持一致。



### 实现逻辑

#### 定价

计算可以兑换的数量：
$$
x * y = k
$$
假设我用`Δx`个 `X`， 去换`Δy`个`Y`。

流动池里x会增加，y会减少。
$$
(x+Δx)(y−Δy)= k = x*y
$$
可以计算出:
$$
Δy=\frac{yΔx}{x + Δx}
$$


所以在合约里，我们定义一个方法，来得到amount：

```solidity
/**
* @param inputAmount Δx数量
* @param inputReserve x的剩余数量
* @param outputReserve y的剩余数量
*/
function getAmount(
    uint256 inputAmount,
    uint256 inputReserve,
    uint256 outputReserve
) private pure returns (uint256) {
    require(inputReserve > 0 && outputReserve > 0, "invalid reserves");

    return (inputAmount * outputReserve) / (inputReserve + inputAmount);
}
```



我们再定义几个简便方法来计算价格：

```solidity
// 传入eth数量，可以得到换取的amount的数量
function getTokenAmount(uint256 _ethSold) public view returns (uint256) {
  uint256 tokenReserve = getReserve(); // 拿到这个exchange合约里对应的reseveToken的数量
	return getAmount(_ethSold, address(this).balance, tokenReserve);
}

// 传入token数量，得到能够换取的eth数量
function getEthAmount(uint256 _tokenSold) public view returns (uint256) {
	  uint256 tokenReserve = getReserve(); // 拿到这个exchange合约里对应的reseveToken的数量
		return getAmount(_tokenSold, getReserve(), address(this).balance)
}
```





#### swap token

先定义一个用ether交换token的方法。

- 先取到用户支付的eth
- 取当前exchange合约里eth的数量

- 再去取当前exchange里token的数量
- 用这3个值计算出用户可以换到的token
- 和用户所期望得到的token数量进行比较
- 执行swap的逻辑。



交易里有一个很重要的理念，不能让用户遭受到损失。

在交易过程中， 因为价格的波动，往往会出现交易的滑点。（可能是正滑点，也可能是负滑点）

如果是负滑点，用户肯定不愿意接受，因为我的实际成交和看到的不符。

另一方面，用户有可能有front-running-bots的攻击。比如用户购买的时候，在用户订单前面插入同样一个订单，再执行用户的订单。那么必然会让用户承受更高的价格。当用户订单完成之后，价格上涨了，再将之前的订单出售，赚取差价。



```solidity
/** 交换token
* @param _minTokenAmount 用户期望的最小兑换的token数量
*/
function swapToken(uint256 _minTokenAmount) public payable {
	
}
```



再定义用token来换eth的方法。

实现逻辑和上面类似，只不过参数需要反过来。

```solidity
// 使用token购买eth
function tokenToEthSwap(uint256 _tokensSold, uint256 _minEth) public {
    uint256 tokenReserve = getReserve();
    uint256 ethBought = getAmount(
        _tokensSold,
        tokenReserve,
        address(this).balance
    );

    require(ethBought >= _minEth, "insufficient output amount");

    bool success = IERC20(tokenAddress).transferFrom(msg.sender, address(this), _tokensSold);
    require(success);
    payable(msg.sender).transfer(ethBought);
}

```



#### LP Token

AMM和外部的中心化交易所会有一定价差，因此这个模型会激励着其他的`流动性提供者`进来平衡pool的价格。

LP Tokens 让 AMMs 变成了 non-custodial的,  liquid pool里的加密币是用户自己私钥控制的， LP tokens代表这些`liquidity providers`的份额证明，通过这些tokens，才能将流动性币池里的币对提出来。



>  non-custodial  (只有用户控制私钥)
>
> custodial (a trusted third party has control of a user’s private keys)



## 为什么会发生`Impermanent Loss` （无常损失）? 

Impermanent Loss 无常损失

假设当前1个ETH = 100DAI，

Alice 在做市池里存了1个ETH和100个DAI，（1DAI = 1USD）总价值200USD。

然后其他和Alice一样的做市商人也存了一些到币池里，流动Pool里一共有10个ETH和1000个DAI。 

```
 k = 10 * 1000 = 10000
```

Alice占用有10%的份额。



假如ETH的价格涨到了400DAI，AAM会把DAI的数量提高，减少ETH的数量，从而保持两者的价值比。

(因为AAM做市的策略是，保证币池里币种的价值占比不变，且保证k值不变)

```
我们令 x = eth的数量, y = dai的数量
初始情况下  x=10; y = 1000;  x * y = 100000;
eth价格涨到400后，
为了保证 (x - x')*(y + y') = k, 且 (x - x') / (y + y') = 400;
可以计算出：
y' = 1000;
x' = 5
```

因此，当币池达到平衡的时候，整个币池的分布是： 5ETH，2000DAI。 

Alice因为占据了10%的份额，所以他应该拥有0.5的ETH，200个DAI，总价值就变成了400USD，看起来赚200USD。

但是假如AAM没有交易，那么他本来持有了1ETH和100DAI，总价值应该是500USD。 

所以，Alice其实是损失了100USD的。

总结： 由于市场行情发生的变化，AAM总是倾向于持有更多的弱势资产。（eth上涨为强势资产，daij就是弱势资产）于是你的流动性会不断的抛出eth，拿到dai。这些抛出的ETH就成为了无常损失的来源。





