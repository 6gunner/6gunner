https://www.zkey.org/

### 是什么是zKey?

zklogin on starknet



### 做了什么？

帮用户创建了一个AA钱包，将web2和web3打通。

对标零钱消费的场景。





### 安全性？

#### sub-q-1:  zkp怎么确保安全性的？

#### 

隐私切入点：slat来解决。slat只是为了解决隐私问题，避免email，name明文传输。 然后zkp也能保证不泄露信息；

安全切入点： contract验证的是用户是否已经通过oauth来授权

流程：

1 - 用户=> google oauth => jwt，google登录可以携带参数，这里要带的就是一个publicKey（前端随机生成的）

2 -  通过slat服务拿到对应的salt。然后去zkp service来生成证明 => 去合约里进行验证；



#### sub-q-2: 底层电路逻辑是什么？





### zklogin最大的应用场景就是在后面集成一个AA钱包？





### slat的作用？

不解决安全性问题，

