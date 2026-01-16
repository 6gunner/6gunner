
需要用到hardhat fork network的功能

首先需要启动一个本地节点，然后设置本地节点是fork某一个链的某一个高度的

这里rpc最好用收费三方的，不然不太好用

```ts
hardhat: {
    chainId: 33333,
    forking: {
      url: "https://sepolia.infura.io/v3/7f5f1846e53c4b9cb05dbc6147931a07",
    },
  },
```



启动本地节点

`npx hardhat node`



然后通过rpc来修改设置下一个区块时间
```shell
curl --location 'http://127.0.0.1:8545' \
--header 'Content-Type: application/json' \
--data '{"jsonrpc":"2.0","method":"evm_setNextBlockTimestamp","params":[1780099200],"id":1}'
```



然后挖一次block，来让block更新

````shell
curl --location 'http://127.0.0.1:8545' \
--header 'Content-Type: application/json' \
--data '{"jsonrpc":"2.0","method":"evm_mine","id":1}'
````

