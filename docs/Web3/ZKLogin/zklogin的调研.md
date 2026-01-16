## 任务



## Phrase One: 10.25

* Wallet frontend - similar to https://www.zkey.org/
* zklogin backend service - API compatible with bundler apis
 * https://github.com/eth-infinitism/bundler
 * https://github.com/stackup-wallet/stackup-bundler
* Research: (Gassa, QB, Xindong, Coda)
 * Validate the feasibility of using Safe Framework with ZKLogin 
 * Bundler customization
 * Pimlico SDK compatibility with solution



## Phrase two

* Safe Related Contracts: deployment + test:  (third-party)
 * Safe v.1.4.1
 * Safe ERC-4337
* Safe Extension Contracts: development + deployment
 * ZKLogin based Safe ERC-7579 (QB)
 * zklogin verifier (zerobase)
* ZKLogin Circuit and Service: development + deployment + test (zerobase)
* Bundler: Implementation + deployment + test (Xintong, Chaopeng, Jun)
* Frontend SDK (Pimlico/Coda)
* Frontent Integration: Coda



## Reference

* https://eips.ethereum.org/EIPS/eip-4337
* https://github.com/stackup-wallet/stackup-bundler
* https://github.com/eth-infinitism/bundler
* https://github.com/eth-infinitism/account-abstraction/tree/main
* https://sepolia.etherscan.io/address/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
* https://docs.safe.global/advanced/erc-4337/overview
* https://vscode.blockscan.com/sepolia/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
* https://docs.pimlico.io/
* https://docs.google.com/document/d/10yPJRdR-C7YoCEW1oYQYW4BeJbYG5fjS4aeOArEHdy0/edit





## 带着问题

Q1: zklogin的proof究竟在做什么验证？



Q2:  怎么将web2和web3用户结合？

A: 

- 拿到用户的google ouath信息，

- 生成一个salt，
- 生成一个用户地址



Q3: 这个用户地址有什么规则？是调用什么接口生成的？

用user salt和jwt来生成的，salt只要变了，地址就会变。最好是存在backend，和uid一一绑定。

demo_user_salt_key_pair

Q4: 用户的私钥怎么保证不被泄露？



Q4

合约地址的创建：

Create2创建  https://docs.openzeppelin.com/cli/2.8/deploying-with-create2



![image-20241010101226730](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2024-10-10/image-20241010101226730.png)





https://github.com/sui-foundation/zklogin-ceremony-contributions/blob/252cec40ffaca4d8c5b5362c1c8ae98c19e788f2/README.md





