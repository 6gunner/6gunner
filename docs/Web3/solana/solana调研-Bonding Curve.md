## 什么是Bonding Curve（联合曲线）？

### 基础概念

Bonding Curve是一个概念，不是一个固定/具体的公式，核心是曲线

公式有多种公式，主要是根据不同的用途和设计而变化。

常见的几种曲线类型包括

- 线性
- 指数
- 对数曲线

每种类型都有其特定的数学表达形式，用于计算代币的价格与其供应量之间的关系。

### 公式说明

最简单的曲线形式如下:

$$
y=m⋅x^n
$$

下图展示了

$$
y=\frac{1}{400}x^2
$$

的图像:

<img src="https://img.gopic.xyz/VanillaCurvePrice.jpg" alt="Vanilla Curve" style={{ zoom: '33%' }} />

### 曲线的作用

下面是假设在pump.fum发行一个meme代币，当池子里面满 500 sol的时候表示曲线：

![img](https://blog.slerf.tools/content/images/2024/05/image-7.png)

### 曲线的理解

在这个图表中，展示Meme 代币的代币价格和数量如何随着基础资产（此处为 SOL）的增加而变化。

- **红色曲线**：显示了 Meme 代币的价格（以 SOL 为单位）随 SOL 总量的变化。显示出随着 SOL 总量的增加，价格急剧上升的趋势。
- **蓝色曲线**：表示池中 Meme 代币的数量，根据价格的倒数计算得出。可以看到，在 SOL 总量较低时，Meme 数量很高。而随着SOL数量的增加，Meme 数量快速减少。
- **灰色阴影面积**：提供了对 SOL 总量增加的直观感受，随着曲线下方的面积增大，表示 SOL 总量的增加。

### 实际pump fun用到的价格公式计算和理解

pump.fun在募资阶段使用到的公式是：

```ts
virtualSolReserves * virtualTokenReserves = K (常量)
```

像是一个改良版的AMM

http://pump.fun 上所有的代币模型是一样的，初始“虚拟市值”设定为 `30SOL`，“虚拟token数量”是`1,073,000,000`， token发型数量是`793,100,000`

```
this.initialVirtualSolReserves 30000000000n // 30
this.initialVirtualTokenReserves 1073000000000000n // 1,073,000,000
this.initialRealTokenReserves 793100000000000n // 793,100,000
```

buy的价格计算公式是：

$$
ΔtokenAmount = virtualToken - \frac{K}{ΔSol + virtualSol}
$$

然后还要根据实际initialRealTokenReserves的大小来返回；

```ts
getInitialBuyPrice(amount: bigint): bigint {
    if (amount <= 0n) {
      return 0n
    }

    let n = this.initialVirtualSolReserves * this.initialVirtualTokenReserves
    let i = this.initialVirtualSolReserves + amount
    let r = n / i + 1n // 代码里会+1为了避免四舍五入的误差,
    let s = this.initialVirtualTokenReserves - r
    console.log('s', s)
    return s < this.initialRealTokenReserves ? s : this.initialRealTokenReserves
  }
```

zenm
