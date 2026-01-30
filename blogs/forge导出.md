---
title: Forge 合约验证与导出
description: 使用 Foundry/Forge 扁平化并验证 Solidity 智能合约
slug: forge-contract-verification
tags: [solidity, forge, ethereum]
authors: [keyang]
hide_table_of_contents: false
---

使用 Foundry/Forge 工具扁平化并验证 Solidity 智能合约的完整流程

<!-- truncate -->

要成功验证并显示合约代码，请按以下步骤操作：



1. 首先将合约代码扁平化（flatten）：

```bash

forge flatten src/ERC20PermitEverywhere.sol > flattened.sol

```



2. 然后使用正确的solidity版本进行验证：




对于Etherscan:

```bash

forge verify-contract \

--chain $CHAIN_ID \

--compiler-version 0.8.15 \

--etherscan-api-key $ETHERSCAN_API_KEY \

--flatten \

$CONTRACT_ADDRESS \

src/ERC20PermitEverywhere.sol:ERC20PermitEverywhere

```



对于Blockscout:

```bash

forge verify-contract \

--chain-id $CHAIN_ID \

--verifier blockscout \

--verifier-url $BLOCKSCOUT_API_URL \

--compiler-version 0.8.15 \

--flatten \

--etherscan-api-key abc \

$CONTRACT_ADDRESS \

src/ERC20PermitEverywhere.sol:ERC20PermitEverywhere

```

