部署一个uniswap版本的permit2合约：`0x1b3b8FB2f8D7A98b64fCcAA23Ddc0B53AB5B137C`

然后部署permit2vault合约，找到了一个[repo](https://github.com/dragonfly-xyz/useful-solidity-patterns.git)，拷到了自己项目里：

最后根据原版repo里测试用例，写了一些测试的unit test

3、为userA mint 普通的erc20 token1 - 1000个,

4、操作用户A的私钥，将token都授权给permit2合约；

5、操作用户A生成签名，

6、操作用户B调用合约的depositERC20方法，将A的签名传入进去，看看能否将用户A的token存入vault里；

6、验证用户A的账户确实转出了对应的token



测试代码：https://github.com/6gunner/solidity-example/blob/feat/uniswap-permit2/test/testPermit2Vault.ts
