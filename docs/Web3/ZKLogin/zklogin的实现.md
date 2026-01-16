想要完成整个流程，需要2~3个工程：

前端工程： 负责发送交易，生成签名等

bunder service：负责接收我发送的rpc请求

backend service: 负责验证token 啥的

bunder 和 backend可以合并到一起；



**中心化流程：**

```
1、前端生成一对秘钥 priv_k, pub_k， 用sha256(pub_k + randomness + maxEpoch)生成nonce
2、前端将nonce传给google oauth provider，然后通过callback，服务端能拿到 jwt token + nonce；
3、服务端解析jwt，拿到iss，sub，aud，认为登录成功，建立session或者其他的token鉴权机制；
4、同时，服务端这个sub对应的用户，生成一个AA/EOA Address，将sub和address绑定在数据库里；
5、前端希望发送一些交易信息，他利用priv_k来进行签名，服务端验签成功后，通过AA/EOA Address里来发送交易；

这里我想知道两个细节：
1、服务端怎么去这sub来生成一个address？ 
2、怎么去验证这签名，或者说怎么拿到这个pub_k信息的？因为服务端只有nonce，randomness，maxEpoch这些信息

A1: 服务端通常不会直接使用sub来生成address。相反,它会使用一种确定性的方法,通常涉及以下步骤:
a) 使用sub作为种子来生成一个确定性的私钥。这可以使用诸如HMAC-SHA256之类的密码学安全的哈希函数来实现。
b) 从这个私钥派生出公钥。
c) 使用标准的地址生成算法(取决于具体的区块链)从公钥生成address。


A2: 前端用ECDSA的签名算法, 理论上可以从签名和消息中重构出pub_k，然后服务端会从新算一次nonce对，来和之前的nonce进行比较，确保一致就认为是签名验证通过。
```





**去中心化流程：** todo 弄明白

![image-20241018170408159](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2024-10-18/image-20241018170408159.png)

和中心化流程一致，只是拿到jwt之后会有所不同：

```
1、用户通过 OAuth 登录后，前端获得用户的 JWT，JWT 中包含 iss、aud、sub 和 nonce 字段。
2、前端解析这些字段，并为用户计算出生成 AA Wallet合约所需的 salt = H(iss, aud, sub)
3、前端附带数据发送请求给zkLogin Service产生相应 proof。

4、Service生成对应的 proof，并将该 proof （包含publicSignals）返回给前端。
5、前端将将获取到的proof（pubsignals 包含 addr2, iss, aud, sub）加上业务参数，并使用priv_k加密签名，一起构造成 UserOperation，发送至 Bundler服务；
6、Bundler服务验证 UserOperation 的合法性，并将操作发送至 EntryPoint 合约。
7、EntryPoint 合约接收到 Bundler 传递的 UserOperation，从UserOperation.proof.pubsignal中计算出salt = H(iss, aud, sub)。
	在映射表中检查 key 为 salt 的字段是否存在。
	如果不存在，则以 salt 为参数为用户创建 AA Wallet 合约，并在映射表中存储相应的 salt 值（key: salt，value: Wallet 合约地址）。
	
8、将UserOperation.proof以及UserOperation.calldata转发至Wallet合约
```

**Q1: 我需要知道生成zkproof证明的入参和出参，以及这个proof怎么在合约里被验证的？** 





**1、创建session key， 使用secp251k1生成key-pair**

这是nodejs的写法

```ts
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

// Generate a new secp256k1 key pair
const privateKey = crypto.randomBytes(32);
const publicKey = secp256k1.publicKeyCreate(privateKey);
```



对应web端的写法

```ts
import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import {
  isValidPrivate,
  isValidPublic,
  privateToAddress,
  privateToPublic,
  pubToAddress,
  toChecksumAddress,
} from "@ethereumjs/util";
import * as eccrypto from "@repo/eccrypto"; // 自己封装的一个lib

  const generateKey = () => {
    const privKeyBuffer = eccrypto.generatePrivate(); 
    if (!isValidPrivate(privKeyBuffer)) {
      throw new Error("Invalid privKey size");
    }
    // const address = generateEthAddress(privKeyBuffer); // @ethereumjs/util提供的方法，可以利用privKeyBuffer生成address
    // setEthAddress(address);

    const publicKeyBuffer = privateToPublic(privKeyBuffer); // @ethereumjs/util提供的方法
    const publicKeyStr1 = Buffer.from(publicKeyBuffer).toString("hex");
    console.log(`publicKeyStr1 = ${publicKeyStr1}`);
    console.log(`publicKeyBuffer length = ${publicKeyBuffer.length}`);

    const publicKeyBuffer2 = eccrypto.getPublic(privKeyBuffer); // 这里自己写的方法，区别在于会多出1个长度，
    const publicKeyStr2 = Buffer.from(publicKeyBuffer2).toString("hex");
    console.log(`publicKeyStr2 = ${publicKeyStr2}`);
    console.log(`publicKeyBuffer2 length = ${publicKeyBuffer2.length}`);
    const slicedPubKeyKeyBuffer2 = publicKeyBuffer2.subarray(1); // 所以需要slice

    if (!isValidPublic(slicedPubKeyKeyBuffer2)) {
      throw new Error("Invalid publicKeyBuffer");
    }
    
    const publicKeyStr = Buffer.from(slicedPubKeyKeyBuffer2).toString("hex"); // uint8Array转成hex
    setKeyPair({
      privKey,
      publicKey: publicKeyStr,
    });
    const address = pubToAddress(slicedPubKeyKeyBuffer2);
    setEthAddress(Buffer.from(address).toString("hex"));
```



**2、生成nonce，并且附带在GoogleOAuth的参数里**









**3、解析jwt，并且生成zkLogin的地址**

```
https://sui-zklogin.vercel.app/#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjczZTI1Zjk3ODkxMTljNzg3NWQ1ODA4N2E3OGFjMjNmNWVmMmVkYTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1NzMxMjAwNzA4NzEtMGs3Z2E2bnM3OWllMGpwZzFlaTZpcDV2amUyb3N0dDYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1NzMxMjAwNzA4NzEtMGs3Z2E2bnM3OWllMGpwZzFlaTZpcDV2amUyb3N0dDYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDE3MDE5MjczNTQ0NDc2NzY0MzEiLCJub25jZSI6Imp6eEM0T0lya0pJT2xQYTlwZHR0bW81MHRhVSIsIm5iZiI6MTcyOTIzMzQyNywiaWF0IjoxNzI5MjMzNzI3LCJleHAiOjE3MjkyMzczMjcsImp0aSI6IjJiMTA5YjI5ZWZlOTg1ZjgyZTNmMWI1OGFhNWM2YTQxYzNlNDM2NjcifQ.fOyYMphJpZy9rORK3Bm6cTtnLOL15ZWDnBjGnEquJzNFi4qStYHqjKEGRggZ8bCCA6AzXZ_9BlFGuW0vGFRrFLT5UYzaZbO8yCXJnD72Z7nLl03fDSkMSuJDO4gBtekBpZ8Jrz5YD7UOgaTYJBFfSjMhAAmF2x7zXUmHO6Coc2k6GmR7qeHh86nMT0ifurYGis4d_UsE0ztme8BbEtdSTZRnbkm8kJdIZl5IP6p528H6qyDZEEUULdL_gNOrly8ViiQ1IWoCFFbCQDFuRddNP6hmw3WUuMvEub5n89u4YAo-5MBKhJmTKHB1Od4OfE24sW3y2Wm5O2dVi2GeMykbNA&authuser=0&prompt=none

const address = await computeZkLoginAddressFromSeed(0n, 'https://accounts.google.com');

```



如果我用ethers，就是用wallet.createRandom

```
const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
```

恢复账户：

```
recoveredWallet = ethers.Wallet.fromPhrase(typedSeed);
```

https://github.com/4337Mafia/awesome-account-abstraction?tab=readme-ov-file





AA钱包的参考

* https://eips.ethereum.org/EIPS/eip-4337
* https://github.com/stackup-wallet/stackup-bundler
* https://github.com/eth-infinitism/bundler
* https://github.com/eth-infinitism/account-abstraction/tree/main
* https://sepolia.etherscan.io/address/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
* https://docs.safe.global/advanced/erc-4337/overview
* https://vscode.blockscan.com/sepolia/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
* https://docs.pimlico.io/
* https://docs.google.com/document/d/10yPJRdR-C7YoCEW1oYQYW4BeJbYG5fjS4aeOArEHdy0/edit
