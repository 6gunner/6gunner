

## Demo2

简介：

这个demo会部署一个permit2合约，一个支持permit2 vault的合约；

然后对这个合约进行测试，验证可以使用签名来对任意的erc20 token进行depositERC20操作；



和demo1的区别在于，这里的erc20-token不用实现ERC20Permit相关的接口



### 测试步骤：

1、部署一个permit2合约

我是找到这个[repo](https://github.com/merklejerk/permit-everywhere)， 属于一个简化版本（能用，但是和uniswap的permit2还是差了一些的）

forge install，部署，拿到合约地址；

2、部署了一个permit2-vault合约，传入步骤1里的合约地址；

3、为userA mint 普通的erc20 token1 - 1000个, mint普通的erc20 token2 2000个;

4、操作用户A的私钥，将token都授权给permit2合约；

5、操作用户A生成签名，调用合约的depositERC20方法将token存入vault里；

6、验证用户A的账户确实转出了对应的token



测试代码：https://github.com/6gunner/solidity-example/blob/main/test/Permit2Vault.ts





