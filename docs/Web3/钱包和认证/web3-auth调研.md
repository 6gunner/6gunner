**Web3-auth做什么的？提供了什么？**

提供了一个云服务，打通了web3 login和oauth login体系；集成了很多auth登录平台，比如google， twitter等，但是需要云服务用户自己去创建、并且填写一些oauth的信息；

UI方面：提供了一个login Moda UI，提供了Multi-Factor Screen配置UI，提供了一个Wallet UI。

还集成了一些业务分析数据；

**服务机制**

背后应该有一套比较强大的中心化后台服务，可以在平台上创建project，配置authentication verifier，自定义一些UI配置等；然后前端服务通过project的clientId来读取配置信息，呈现给用户侧；

**google的配置**：https://web3auth.io/docs/auth-provider-setup/social-providers/google

![image-20241012143702626](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2024-10-12/image-20241012143702626.png)

**jwks是什么？**

Json web key set 表示一组公钥的JSON格式。这些公钥通常用于验证JSON Web Token (JWT)的签名.

### 带着问题

**1、底层怎么实现的？oauth登录后，背后的钱包是如何创建的？怎么和OAuth Identity绑定的？**

- 前端利用clientId来获取对应的project配置

  ```json
  curl 'https://signer.web3auth.io/api/configuration?project_id=BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ&network=sapphire_mainnet&whitelist=true' \

  response: {
    "sms_otp_enabled": true,
    "wallet_connect_enabled": true,
    "key_export_enabled": true,
    "whitelabel": {
        "appName": "Web3Auth",
        "logoLight": "https://web3auth.io/images/web3authlog.png",
        "logoDark": "https://web3auth.io/images/web3authlogodark.png",
        "mode": "light",
        "defaultLanguage": "en",
        "useLogoLoader": true,
        "theme": {
            "primary": "#0364FF",
            "onPrimary": "#FFFFFF"
        }
    },
    "wallet_connect_project_id": "04309ed1007e77d1f119b85205bb779d",
    "whitelist": {
        "urls": [
        ],
        "signed_urls": {
        }
    }
  }

  ```

- 然后前端跳转到授权登录页面，这里以Google OAuth为例

  ```
  https://accounts.google.com/o/oauth2/v2/auth?state=xxxx&response_type=token+id_token&client_id=876733105116-gksnup3bm0nngpucmerrp9qrt15igcih.apps.googleusercontent.com&prompt=consent+select_account&redirect_uri=https%3A%2F%2Fauth.web3auth.io%2Fauth&scope=profile+email+openid&nonce=ds44rahloy


  ```

  他的redirect地址是到https://auth.web3auth.io/auth，**需要理解的是这个state怎么算的？**

  **/auth这个api服务后台是怎么去处理业务逻辑的？**

  **成功后怎么redirect回来的？我是localhost，它为什么能知道？**

  回调完成后，一些token是怎么给的？通过cookie么？

  前端去请求后端服务api，确认是不是登录成功了

  ```
  https://signer.web3auth.io/api/feature-access?client_id=BPi5PB_UiIZ-xxx-xxx&network=sapphire_mainnet&is_wallet_service=true&enable_gating=true&is_whitelabel=true

  ```

**怎么验证的id token？**

- 拿到idToken:

  ```
  "idToken": "xxxx.xxxx.xxxx"
  ```

原理是使用**jwks**来验证jwt，确认是web3auth发行商发型的；

```
// 20241012180208
// https://api-auth.web3auth.io/jwks

{
  "keys": [
    {
      "kty": "EC",
      "crv": "P-256",
      "x": "PzwlL8X3P1SpXieB8i6z-KzqVEPI8Vu_JysBiGa7dgA",
      "y": "7OtaCKJjbNvs3Oo5pmwGkWKm4oJZOiyl2oWb_odopKo",
      "kid": "TYOgg_-5EOEblaY-VVRYqVaDAgptnfKV4535MZPC0w0",
      "use": "sig",
      "alg": "ES256"
    }
  ]
}
```

前端实现的话会利用到npm的一个`package jose`

**2、为什么还是一个EOA，而不是一个AA？**

目前看到的是支持两种模式，

- AA只用在多签钱包里，

- 普通的都是用的EOA，还能导出private key

**3、private key怎么生成的？每次登录地址会变吗？**

同一个network，同一个OAuth Provider，地址是相同的。**但是这个privateKey怎么生成的还不知道**，

前端代码看到的：

通过sessionId + 服务端接口调用resp解密出来的，具体的代码在@toruslabs/session-manager里面。

**但是resp怎么生成的还不知道**

以下是前端解密后的结果：

```
{
  "authToken": "xxx.xxx.xxx",
  "coreKitEd25519PrivKey": "",
  "coreKitKey": "",
  "ed25519PrivKey": "xxxxx",
  "factorKey": "",
  "keyMode": "1/1",
  "metadataNonce": "xx",
  "nodeIndexes": [],
  "oAuthPrivateKey": "xxxx",
  "privKey": "xxx",
  "sessionId": "xxxx",
  "shareDetails": [],
  "signatures": [
    "{\"data\":\"xx\",\"sig\":\"xx\"}",
    "{\"data\":\"xx\",\"sig\":\"xxx\"}",
    "{\"data\":\"xxx\",\"sig\":\"xxx\"}"
  ],
  "tKey": "xxx",
  "tssNonce": 0,
  "tssPubKey": "",
  "tssShare": "",
  "tssShareIndex": 0,
  "useCoreKitKey": false,
  "userInfo": {
    "aggregateVerifier": "web3auth-google-sapphire",
    "appState": "",
    "dappShare": "",
    "email": "coda@xx.xxx",
    "idToken": "xxx.xxx.xxx",
    "isMfaEnabled": false,
    "name": "Coda Coda",
    "oAuthAccessToken": "",
    "oAuthIdToken": "",
    "profileImage": "https://lh3.googleusercontent.com/a/xx-xx=s96-c",
    "typeOfLogin": "google",
    "verifier": "web3auth",
    "verifierId": "coda@xx.xxx"
  },
  "walletKey": ""
}
```

4、Wallet背后的安全性怎么保证?

搞懂流程应该就知道了

5、github上那些repo分别是干嘛的？

- web3auth-pnp-examples : https://github.com/Web3Auth/web3auth-pnp-examples 提供了很多plug n play的demo。

支持很多平台：web的，iOS，Fluter的...

有很多不同的模式：单Verify的，多verify的；有modal，无modal的；有evm-based链，以及其它链的；
