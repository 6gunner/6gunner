参考资料：https://decert.me/tutorial/sol-dev/

## 一、创建公私钥：

```
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();

console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);
console.log(`The secret key is: `, bs58.encode(keypair.secretKey));
```

solana的公私钥也是椭圆曲线非对称加密算法，具体的是：`ed25519`算法；

```
The public key is:  3foZz6gPtZuQPcMy7Kcr6jGdf9QFPfLnk9eUDP39P4TE

The secret key is:  Uint8Array(64) [
  171,  35,  82, 158,  51, 153, 127,  37, 164, 151,  45,
  101, 185,  62, 167,  42, 168, 153, 252,  39, 240,  87,
   75,  35, 232,  95,  78, 131,  26,  29, 163, 158,  39,
  168,  25, 153,  11, 122, 132,   9,  13,  76, 159, 136,
  212, 200, 206, 169,  92, 122, 218, 228, 113, 225, 189,
  155, 127,  72, 229, 246, 199,  91, 109,  13
]


```

另外：默认的Solana 私钥是以字节数组的形式存储的。因为私钥本质上就是一个 32 字节（256 位）的随机数。在内存中以字节数组形式存储是最自然和高效的方式。

如果为了抄写，会转化为base58的格式。Base58 已经成为 Solana 生态系统的标准编码方式，用于地址、私钥等的字符串表示。

## 二、加载公私钥

2.1 如果env里存储的是Uint8Array，那么直接用`@solana-developers/helpers`提供的方法就可以加载了

```
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const keypair = getKeypairFromEnvironment("SECRET_KEY");
console.log(keypair.publicKey.toBase58()); // ensure it equals (BCb4nKwXonmVnjnxXW83PEpXxYFJHPFzWDAwYq67rPc7)

```

2.2 如果env里存储的是base58 encode过的

```
import "dotenv/config";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

async function loadFromEnv() {
  const privateKey = process.env.PRIVATE_KEY || "";
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(privateKey))
  );
  console.log(keypair.publicKey.toBase58()); // ensure it equals (BCb4nKwXonmVnjnxXW83PEpXxYFJHPFzWDAwYq67rPc7)
}

loadFromEnv();
```

## 三、账户体系

`1 sol = 10^9 lamports`

### 3.1 sol上的account-modal和evm的account-modal有何不同？

## 四、交易转账

sol通过cluster连接到网络，有点类似evm上的rpc（反正都是通过一个服务连上的），

然后solana有3种网络：devnet，testnet，mainnet（类似btc的）

### 4.1 交易的结构体

每个交易包含：

- 一个数组：包含打算read/write的account
- 一个或者多个**instruction**
- 一个最近的block hash
- 一个或者多个signature

每一个instruction包含：

- 目标程序id - progam id
- 所有涉及到的账户 - accounts
- 指令data （底层是byte array, js里是uint8array）

solana的交易是通过指令（`instruction`）来发送的，一笔交易可以包含N个`instruction`

![Transaction Simplified](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-01-07/transaction-simple.svg)

#### **4.1.1 instruction的组成**

![Transaction Instruction](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-01-07/instruction.svg)

```ts
type TransactionInstructionCtorFields = {
  keys: Array<AccountMeta>; //账户列表
  programId: PublicKey; //指定solana合约代码的programId
  data?: Buffer; //需要执行的指令数据
};
```

> 在 Solana 上创建 instruction 需要的关键元素:
>
> 1. Program ID (程序ID)
>    - 这是你要调用的程序的地址
>    - 每个 instruction 必须指定要与哪个程序进行交互
> 2. Accounts (账户列表)
>    - 包含所有instruction执行过程中需要读取或写入的账户
>    - 每个账户需要指定:
>      - pubkey: 账户的公钥
>      - isSigner: 是否需要签名
>      - isWritable: 是否可写入
>    - 账户顺序必须严格按照程序定义的顺序排列
> 3. Instruction Data (指令数据)
>    - 这是传递给程序的具体参数
>    - 通常需要序列化成字节数组，sdk会使用[borsh](https://borsh.io/)来自动序列化好，不用我们操心；
>    - 数据格式需要与程序端定义的格式完全匹配
>    - 一般包含:
>      - 指令标识符(通常是第一个字节，用来区分不同的指令)
>      - 实际参数数据

#### 4.1.2 一笔transfer的instructions结构

包含了两个accounts，sender必须要有`is_signer`属性，receiver需要是`is_writable`

![SOL Transfer](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-01-07/sol-transfer.svg)

```tsx
// transfer的instrction结果
const transferInstruction = SystemProgram.transfer({
    fromPubkey: from,
    toPubkey: to,
    lamports: transferAmount * LAMPORTS_PER_SOL, // Convert transferAmount to lamports
  });

TransactionInstruction {
  keys: [
    {
      pubkey: [PublicKey [PublicKey(BCb4nKwXonmVnjnxXW83PEpXxYFJHPFzWDAwYq67rPc7)]],
      isSigner: true,
      isWritable: true
    },
    {
      pubkey: [PublicKey [PublicKey(EZ3rV7vzTBMDzYFu716tH2U1H3szxPhcdNcvkEb3uNCE)]],
      isSigner: false,
      isWritable: true
    }
  ],
  programId: PublicKey [PublicKey(11111111111111111111111111111111)] {
    _bn: <BN: 0>
  },
  data: <Buffer 02 00 00 00 80 96 98 00 00 00 00 00>
}
```

## 五、尝试调用简单的”合约“程序

我们创建一个简单的指令，用来ping一个程序。

    - 指定程序的programId，类型也是PublicKey：`new PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")`

- 指定参与的accounts
  - 一个是program data account
  - 另一个是signer account
- 指定和program交互的data： `Buffer.from("ping")`

**为什么需要program data account？**

```
因为Solana程序（智能合约）本身不能存储状态，所有的状态数据都需要存储在单独的账户中，PING_PROGRAM_DATA_ADDRESS 就是这样一个用来存储数据的账户；

PING_PROGRAM_ADDRESS 是程序本身的地址；

当我们发送 "ping" 指令时，程序会更新这个数据账户中的信息
```

**详细代码**

```tsx
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import 'dotenv/config';
import base58 from 'bs58';
import { getKeypairFromEnvironment } from '@solana-developers/helpers';

const payer = getKeypairFromEnvironment('SECRET_KEY');
const connection = new Connection(clusterApiUrl('devnet'));

const PING_PROGRAM_ADDRESS = new PublicKey(
  'ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa'
);
const PING_PROGRAM_DATA_ADDRESS = new PublicKey(
  'Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod'
);

async function sendPingTransaction() {
  const transaction = new Transaction();

  const instruction = new TransactionInstruction({
    programId: PING_PROGRAM_ADDRESS,
    data: Buffer.from('ping'),
    keys: [
      {
        pubkey: PING_PROGRAM_DATA_ADDRESS, // 为什么需要这个？因为solana上的program无法存数据，必须要单独创建一个存储数据的地址；
        isSigner: false,
        isWritable: true,
      },
    ],
  });

  transaction.add(instruction);
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    { commitment: 'confirmed' }
  );
  console.log(
    `You can view your transaction on the Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
  );
}

sendPingTransaction();
```

## 六、尝试连接solana钱包

### 6.1 依赖库

- `@solana/wallet-adapter-base` : core方法

- `@solana/wallet-adapter-react`： 提供了一些Provider，hooks

- `@solana/wallet-adapter-react-ui`： 一些组件ui, 比如`WalletModalProvider`组件

- `@solana/wallet-adapter-wallets` ： 支持所有钱包的adapter

- `@solana/wallet-adapter-phantom`: 仅支持phantom的adapter

使用 @solana/wallet-adapter-wallets 的主要场景是：

- 需要限制只支持特定的几个钱包
- 需要为钱包适配器提供特定的配置参数
- 需要自定义钱包的连接行为
- 需要支持特定网络（比如只支持 devnet 或 mainnet）
- 如果你没有这些特殊需求，继续使用当前的配置就可以了

### 6.2 连接钱包 // todo 整理使用的一些理论知识

- native写法：`window.solana.connect`

- 使用`@solana/*`的依赖：

​ 主要是`@solana/wallet-adapter-react-ui`里提供了modalProvider，button等组件，可以触发。

```

```

### 6.3 Sign Transaction

```tsx
const { blockhash } = await connection.getLatestBlockhash();

let transaction = new Transaction({
  feePayer: publicKey,
  recentBlockhash: blockhash,
}).add(
  new TransactionInstruction({
    data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
    keys: [],
    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
  })
);

transaction = await signTransaction(transaction);
if (!transaction.signature) throw new Error('Transaction not signed!');
const signature = bs58.encode(transaction.signature);
```

### 6.4 Sign Message

```tsx
const message = new TextEncoder().encode(
  `${
    window.location.host
  } wants you to sign in with your Solana account:\n${publicKey.toBase58()}\n\nPlease sign in.`
);
const signature = await signMessage(message);
```

### 6.5 Send Transaction

**Legacy tx**

```tsx
const {
  context: { slot: minContextSlot },
  value: { blockhash, lastValidBlockHeight },
} = await connection.getLatestBlockhashAndContext();

const message = new TransactionMessage({
  payerKey: publicKey,
  recentBlockhash: blockhash,
  instructions: [
    {
      data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    },
  ],
});
const transaction = new VersionedTransaction(message.compileToLegacyMessage());

signature = await sendTransaction(transaction, connection, { minContextSlot });
notify('info', 'Transaction sent:', signature);

await connection.confirmTransaction({
  blockhash,
  lastValidBlockHeight,
  signature,
});
```

**现在的Tx**

```tsx
const {
  context: { slot: minContextSlot },
  value: { blockhash, lastValidBlockHeight },
} = await connection.getLatestBlockhashAndContext();

const transaction = new Transaction({
  feePayer: publicKey,
  recentBlockhash: blockhash,
}).add(
  new TransactionInstruction({
    data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
    keys: [],
    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
  })
);

signature = await sendTransaction(transaction, connection, { minContextSlot });
notify('info', 'Transaction sent:', signature);

await connection.confirmTransaction({
  blockhash,
  lastValidBlockHeight,
  signature,
});
```

## 七、构建指令数据-instruction data

### 7.1 如何组装instruction data

solana里指令数据可以灵活构建，就像http里body里的request data一样。

但是构建的**结构体**要符合接收方定义的结构，就像**restfull-api**里服务端定义的接口一样，客户端需要按这个接口要求的参数来传递。

理论上有哪些步骤：

1、首先设计结构体，用borsh来组装出一个struct，得到schema；

2、然后用schema encode数据，将数据写入到一个buffer区

3、从buffer缓冲区里slice得到有数据的部分，得到buffer data

4、构建交易:

- 获取所有账户信息，添加到instruction-keys里
- 填入data, programId;
- 调用sendTransaction方法

### 7.2 DEMO: movie-review

#### 7.2.1 序列化

#### 7.2.2 反序列化

PDAs: solana上“智能合约”不存储数据，program会有额外的数据存储地址，叫做Program Derived Address。

它是由seed + ProgramId推算出来的。

有三种情况：

- 情况1-全局存储地址：有固定的seed + 固定的ProgramID推算。比如简单的ping程序，所有交互的数据都存储在一个地址上

  ```tsx
  const [pda, bump] = await findProgramAddress(
    Buffer.from('GLOBAL_STATE'),
    programId
  );
  ```

  <img src="https://github.com/0xdwong/rust-solana-bootcamp/blob/main/assets/pdas-global-state.svg/?raw=true" alt="Global state using a PDA" style={{ zoom: '50%' }} />

- 情况2-每一个地址有一个自己的PDA。这种一般用户的PublicKey会参与进行推算；

  ```tsx
  const [pda, bump] = await web3.PublicKey.findProgramAddress(
    [publicKey.toBuffer()],
    programId
  );
  ```

​ ![Per user state](https://github.com/0xdwong/rust-solana-bootcamp/blob/main/assets/pdas-per-user-state.svg/?raw=true)

- 情况3-每个用户有多个数据项，因此会有多个PDAs。比如Movie-Review程序，每一个电影的title都会推算一个地址。

  ```tsx
  const [pda, bump] = await web3.PublicKey.findProgramAddress(
    [publicKey.toBuffer(), Buffer.from('Shopping list')],
    programId
  );
  ```

#### 7.2.3 查询所有的program-data

```tsx
const accounts = await connection.getProgramAccounts(
  programId // programId
);
```

#### 7.2.4 分页查询的方法

1、先查询出所有accounts列表(只查地址信息，不查地址上存储的数据信息\*\*)；

主要是传**dataSlice**字段，它允许您提供两件事：

- `offset` 从数据缓冲区开始的偏移量开始切片
- `length` 从提供的偏移量开始返回的字节数

2、然后对accounts进行分页，比如1页10数据，那么就会得到10个account id；

3、再用这个10个account address进行查询 (getMultipleAccountsInfo)

```tsx
const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
  queryKey: ['movie-accounts'],
  queryFn: async () => {
    const accounts = await connection.getProgramAccounts(
      MOVIE_REVIEW_PROGRAM_ADDRESS,
      {
        dataSlice: {
          offset: 0,
          length: 0,
        },
      }
    );
    return accounts.map((item) => item.pubkey);
  },
});

console.log('isLoadingAccounts', isLoadingAccounts);

const totalPages = Math.ceil(accounts.length / pageSize);
const paginatedAccounts = accounts.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

const { data: movies = [], isFetching: isLoadingMovies } = useQuery({
  queryKey: ['movies', paginatedAccounts],
  queryFn: async () => {
    const accountInfos =
      await connection.getMultipleAccountsInfo(paginatedAccounts);
    return accountInfos
      .map((account) => Movie.deserialize(account?.data))
      .filter((movie): movie is Movie => movie !== null);
  },
  enabled: paginatedAccounts.length > 0,
  placeholderData: (previousData) => previousData,
});
```

#### 7.2.5 数据排序

1、根据data的schema，来计算要排序字段的偏移量和length

```tsx
borsh.struct([
  borsh.bool('initialized'), // 1 字节
  borsh.u8('rating'), // 8位；1字节
  borsh.str('title'),
  borsh.str('description'),
]);
```

我们想针对title进行alphabetic排序，所以要计算tilte的偏移量：

```tsx
initialized (bool) - 1 byte
rating (u8) - 1 byte
title (string) - 从第 2 个字节开始
```

2、修改dataSlice参数，请求想要的信息，

```tsx
const accounts = await connection.getProgramAccounts(
  new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID),
  {
    dataSlice: { offset: 2, length: 18 },
  }
);
```

3、按业务进行排序

注意标题的前4个字节是标题的长度，因此我们如果想获取标题的内容，得从data的第4个字节开始；

```tsx
const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['movie-accounts'],
    queryFn: async () => {
      try {
        const accounts = await connection.getProgramAccounts(
          MOVIE_REVIEW_PROGRAM_ADDRESS,
          {
            dataSlice: {
              offset: 2,
              length: 8,
            },
          }
        );

        const accountsWithTitle = accounts.map(({ pubkey, account }) => {
          // 获取第一个完整字符，无论是英文还是中文，预留足够空间给可能的中文字符
          const firstCharBytes = account.data.subarray(4, 8); // 从4开始时因为string类型前4个字节是表示长度的
          const firstChar = new TextDecoder().decode(firstCharBytes).charAt(0);
          return { pubkey, firstChar };
        });

        accountsWithTitle
          .filter(item => item.firstChar.trim() !== '')
          .sort((a, b) => a.firstChar.localeCompare(b.firstChar, 'zh-Hans-CN'));
        debugger;
        return accountsWithTitle.map(item => item.pubkey);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error;
      }
    }
```

#### 7.2.6 增加过滤条件

使用 `getProgramAccounts的config` 参数的 `filters` 属性来根据特定数据过滤账户。

只能过滤program上存储的 data；

## 八、使用token程序创建coin

solana里的同质化，非同质化的（nft）都叫SPL-Token.

### 8.1 创建token需要知道的基础知识：

1. Token Mint : token的mint机构，每一个token都有一个唯一的mint地址。mint账户上存储了token的基本信息：

   包括name，supply，decimal，token authority（mintAuthority， freezeAuthority）等
   - **mintAuthority**: 授权可以mint token的account address。

   - **freezeAuthority**: 一个授权允许冻结账户的account address

   ![Mint Account](https://solana-developer-content.vercel.app/assets/docs/core/tokens/mint-account.svg)

2. Token Account：用来存储特定token的账户。每一个token account都只能和特定的mint关联，也可以理解一个token account只能存储某一特定类型的token。**因为历史遗留问题，造成一个用户可以拥有同一个token的多个token account，后面被`associated token accounts`替代了。** token account上存储了以下信息：
   - 余额Amount
   - 所有者 owner
   - mint
   - 是否被冻结

   ![Token Account](https://solana-developer-content.vercel.app/assets/docs/core/tokens/token-account.svg)

3. `Associated token accounts`: 和token account功能一样，它是根据用户的publicKey, token mint，用标准化的算法derived出来的地址；基本上一个account，一种mint只能有一个地址，可以通过`getAssociatedTokenAddressSync`推算出来。

   以usdc为例，每一个用户的account address不一样

   <img src="https://solana-developer-content.vercel.app/assets/courses/unboxed/atas-are-pdas.svg" alt="ATAs are PDAs" style={{ zoom: '33%' }} />

   ![Accounts Relationship Expanded](https://solana-developer-content.vercel.app/assets/docs/core/tokens/token-account-relationship-ata.svg)

有两种类型的token： mint A Account， mint B account

wallet1关联A，B，得到了两个PDA

wallet2同样也有两个PDA

### 8.2 create token需要那几步骤?

https://solana.com/developers/courses/tokens-and-nfts/token-program

创建新的代币：1-首先要创建一个 mint 账户，2-创建一个token account，并且关联到mint 账户上，3-最后铸造token，需要指定mint 和 token account（接收用）

#### 1、create a new token mint

创建一个token mint实际上是2步：

- create a new account (随机创建一个新账户)
- init a new token mint （将这个新账户作为token mint地址， createInitializeAccountInstruction）

```
async function createTokenMint() {
  // This is a shortcut that runs:
  // SystemProgram.createAccount()
  // token.createInitializeMintInstruction()
  // See https://www.soldev.app/course/token-program
  const tokenMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    2
  );

  const link = getExplorerLink("address", tokenMint.toString(), "devnet");

  console.log(`✅ Finished! Created token mint: ${link}`);
}
```

https://explorer.solana.com/address/E9ZvwHTLdGwEDyPiVFwLWRgeAisTDSv9FhHgCy1yaxiH?cluster=devnet

#### 2、Rent and Rent Exemption

创建token需要存放一定量的sol到账户里，这样才能免组件。

我们称为Rent Exemption。（租金豁免）

可以通过这个方法获取需要存入的sol数量

```
getMinimumBalanceForRentExemptMint
```

#### 3、create token account

token account用来存储mint的token，我们现在都会用owner+ mint account 推算出 Associate Token Account(PDA)

（当然也可以自己创建一个随机账户，然后指定为Token Account，**历史方式不推荐**）

包含两个步骤:

- create a new account(随机创建一个账户)
- initalize the account as a Token Account(当做Token Account)

这里我们用主流的方法：使用 `getOrCreateAssociatedTokenAccount` 函数来创建我们的代币账户。该函数如果代币账户已存在，则获取 Token 账户的地址。如果不存在，则将在适当的地址创建一个新的关联 Token 账户。

```tsx
// 上一步创建出来的
const tokenMint = new web3.PublicKey(
  'E9ZvwHTLdGwEDyPiVFwLWRgeAisTDSv9FhHgCy1yaxiH'
);

async function createPDA() {
  let tokenAccount;
  try {
    tokenAccount = await token.getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenMint,
      payer.publicKey,
      false
    );
  } catch (error) {
    console.log(error);
  }

  console.log(
    `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
  );

  return tokenAccount;
}
```

#### 4、mint token

mint token的地址需要有权限，也就是mint account里记录的Mint Authority

![image-20250115155248919](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-01-15/image-20250115155248919.png)

```tsx
const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
const payer = getKeypairFromEnvironment('SECRET_KEY');

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${payer.publicKey.toBase58()}`
);

// 上一步创建出来的
const tokenMintAccount = new web3.PublicKey(
  'E9ZvwHTLdGwEDyPiVFwLWRgeAisTDSv9FhHgCy1yaxiH'
);
// 也可以推算出来
const destination = new web3.PublicKey(
  '7CR3pKiBxvJmaop5rjXKLUXZNN8n1h6qgJmzAVeJ52k2'
);

async function mintToken() {
  // let tokenAccount: token.Account;
  try {
    // 推算当前账户对应的associate token account
    // tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    //   connection,
    //   payer,
    //   tokenMintAccount,
    //   payer.publicKey,
    //   false
    // );
    // console.log(
    //   `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
    // );
    const transactionSignature = await token.mintTo(
      connection,
      payer,
      tokenMintAccount,
      destination,
      payer,
      100
    );
    console.log(
      `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    );
  } catch (error) {
    console.log(error);
  }
}
```

结果：

![image-20250115160244257](https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-01-15/image-20250115160244257.png)

#### 5、授权token

#### 6、transfer token

#### 7、 取消授权

solana上，一个token account同时只能有一个 delegate（被授权者）

#### 8、销毁token

一笔交易的payer和signer可以是分开两人， spl-token提供了createBurnInstruction方法，用来满足这种需求

```ts
const connection = new web3.Connection(web3.clusterApiUrl('devnet'));

const delegator = getKeypairFromEnvironment('DELEGATOR_SECRET_KEY');
const payer = getKeypairFromEnvironment('SECRET_KEY');

const tokenMintAccount = new web3.PublicKey(
  'E9ZvwHTLdGwEDyPiVFwLWRgeAisTDSv9FhHgCy1yaxiH'
);

const delegatorTokenAccount = new web3.PublicKey(
  '5QMVBgUuNCin5czdfxrWy586UoTWW6HaWDL4HV1epXpf'
);

async function burnTokens() {
  const burnInstruction = token.createBurnInstruction(
    delegatorTokenAccount, // token账户
    tokenMintAccount, // mint账户
    delegator.publicKey, // authority
    25 * 10 ** 2 // 数量
  );

  // 创建交易
  const transaction = new web3.Transaction().add(burnInstruction);

  // 设置付费账户
  transaction.feePayer = payer.publicKey;

  // 获取最新的 blockhash
  const latestBlockhash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = latestBlockhash.blockhash;

  // 获取所有必要的签名
  const signedTransaction = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, delegator]
  );

  console.log(
    `Burn Transaction: https://explorer.solana.com/tx/${signedTransaction}?cluster=devnet`
  );
}

burnTokens();
```
