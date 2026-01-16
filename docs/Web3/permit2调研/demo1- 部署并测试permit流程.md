

## Demo1

简介：

这个demo会部署一个permit token合约，一个支持permit vault的合约，然后对这个合约进行测试，验证可以使用签名来进行transfer操作；



### 测试步骤：

1、部署一个erc20 token合约`PermitTestToken`，这个合约实现了ERC20Permit相关方法, 然后给用户A mint 200个

2、部署一个valut合约，投票

3、操作A账户的私钥，生成签名，然后调用depositWithPermit方法，为A存入1个token，

4、测试A的账户确实转出了1个token

5、比较调用deposit方法，看看两者的区别；



代码：https://github.com/6gunner/solidity-example/blob/main/test/PermitTransfer.ts