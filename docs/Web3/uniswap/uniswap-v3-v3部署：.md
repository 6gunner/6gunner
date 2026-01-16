
# Uniswap V3 Deployment Checklist

1. **Deploy the V3 Protocol Contracts**
    
    - Create and fund the deployment account for gas fees (40-50M gas required)
    - Run the deployment command using the CLI
    - Follow the CLI instructions: [Deployment Checklist for Uniswap V3 CLI Script](#Deployment-Checklist-for-Uniswap-V3-CLI-Script)
        - [https://github.com/Uniswap/deploy-v3](https://github.com/Uniswap/deploy-v3)
2. **Deploy the Subgraphs**
    
    - Set up a Subgraph to index Uniswap activity on the new chain
    - Edit an existing Subgraph from another chain to match the new deployment
    - Submit the new Subgraph to The Graph
    - Follow the detailed instructions here: [Deploying the Subgraphs Checklist](#Deploying-the-Subgraphs-Checklist)
        - [https://github.com/Uniswap/v3-new-chain-deployments/blob/main/subgraph_instructions.md](https://github.com/Uniswap/v3-new-chain-deployments/blob/main/subgraph_instructions.md)
3. **Update the Smart Order Router**
    
    - Add references to the new deployment in the open-source package
    - Test the changes locally
    - Open a PR in the repo to merge the changes
    - Update instructions: [Adding a New Chain to Router Checklist](#Adding-a-New-Chain-to-Router-Checklist)
        - [https://github.com/Uniswap/smart-order-router#adding-a-new-chain](https://github.com/Uniswap/smart-order-router#adding-a-new-chain)
4. **Create Your Token List**
    
    - Author, validate, and host a token list for supported tokens on the new chain
    - Follow the instructions in the Token Lists Package
5. **Update the Uniswap Interface**
    
    - Add constants and links for the new chain in the Uniswap App and Uniswap Widgets repositories
    - Update the look and feel of the interface for the new chain
    - Test the integration locally
    - Submit a PR to the Uniswap/interface main branch for review
6. **Update the Info Site**
    
    - Add the new chain`s Subgraph clients to the Info site (if supported)
    - Add constants and links for the new chain
    - Update the look and feel of the Info site for the new chain
    - Test the changes locally
    - Submit a PR to the open-source Info Repo
7. **Bridge Uniswap Governance**
    
    - [Coming Soon]
8. **Validate Your Deployment**
    
    - Compile the list of deployed addresses from the deploy-v3 script
    - Verify all contracts on the blockchain explorer
    - Compare bytecode to the mainnet deployment (differences should only be in contract immutables and addresses)
    - Test the deployment with various use cases (e.g., swapping native assets and ERC20 tokens, adding/removing liquidity with native assets)

# [](#Deployment-Checklist-for-Uniswap-V3-CLI-Script "Deployment-Checklist-for-Uniswap-V3-CLI-Script")Deployment Checklist for Uniswap V3 CLI Script

1. Review Licensing:
    
    - Check Uniswap V3`s BUSL license status and change date (2023-04-01).
    - Follow Uniswap Governance process for exceptions or moving the change date.
2. Prepare for deployment:
    
    - Fund an address and obtain the private key for the deployment transactions.
    - Identify the required contract addresses and parameters:
        - WETH9 address
        - Native currency label (e.g. ETH)
        - Owner address
        - (Optional) V2 core factory address
        - (Optional) Gas price in GWEI
        - (Optional) Confirmations
3. Run the deployment script:
    
    - Execute the command: npx @uniswap/deploy-v3 [options]
    - Provide the required options as arguments
    - Save migration state in a JSON file (default: ./state.json)
4. Verify deployment:
    
    - Check the block explorer verification process specific to the network.
    - Use the @nomiclabs/hardhat-etherscan hardhat plugin for existing deployments.
5. Adjust confirmation settings:
    
    - Set confirmations to 0 if the network only mines blocks when transactions are queued.
6. Troubleshoot and monitor deployment:
    
    - Delete state.json for a fresh deploy if needed.
    - Check state.json for the final deployed addresses and progress.
    - Monitor gas usage, estimated to be between 30M - 40M gas.
    - Track the deployment time based on confirmation times and gas parameters.
    - Report issues or ask questions in the GitHub repo`s issues section.
7. Development and testing:
    
    - Run unit tests with `yarn test`
    - Test the script with `yarn start`
    - Publish the script using `npm version` and `npm publish`

Remember to always use the latest version of the script by checking the documentation and using the `--help` flag.

# [](#Adding-a-New-Chain-to-Router-Checklist "Adding-a-New-Chain-to-Router-Checklist")Adding a New Chain to Router Checklist

1. Deploy contracts on the new chain and add pools to the subgraph.
    
2. Populate v3 providers:
    
    - Update `src/providers/v3/subgraph-provider`.
    - Update `src/providers/v3/static-subgraph-provider`.
3. Configure chain and address settings:
    
    - Update `src/util/chains.ts` with the new chainId.
    - Update `src/util/addresses.ts` with the contract addresses for the new chain.
4. Populate token providers:
    
    - Update `src/providers/caching-token-provider`.
    - Update `src/providers/token-provider.ts`.
5. Update gas constants:
    
    - Populate gas constants for the new chain in `src/routers/alpha-router/gas-models/*`.
6. Configure base tokens:
    
    - Update `src/routers/legacy-router/bases.ts` with the base tokens for the new chain.
7. Update integration tests and static subgraph provider:
    
    - Populate `test/integ/routers/alpha-router/alpha-router.integration.test.ts`.
    - Update `src/providers/v2/static-subgraph-provider.ts`.
8. Update alpha router components:
    
    - Populate `src/routers/alpha-router/*` with the new chain-specific configurations.
9. Add an entry to the Changelog:
    
    - Update `/CHANGELOG.md` with details of the new chain addition.
10. Run integration tests:
    
    - Execute `npm run integ-test` and ensure successful completion.

# [](#Deploying-the-Subgraphs-Checklist "Deploying-the-Subgraphs-Checklist")Deploying the Subgraphs Checklist

1. Confirm the new chain is supported by The Graph and create an account on The Graph.

## [](#Block-Indexer-Deployment "Block-Indexer-Deployment")Block Indexer Deployment:

2. Fork the blocks-subgraph.
    
3. Deploy a simple dummy contract on the new chain and replace the existing ABI `ConverterRegistryContract.json` with the ABI from your dummy contract deployment.
    
4. Update the `abi` values in `subgraph.yaml` to the name of the new ABI file.
    
5. Adjust the `startBlock` key values in `subgraph.yaml` to the block number before your Uniswap core and periphery contracts deployment.
    
6. Add a script to the `package.json` file that includes your access token, for example:
    

`"deploy-to-new-chain": "graph deploy --access-token ${ACCESS_TOKEN} github-username/subgraph-name --ipfs https://api.thegraph.com/ipfs/ --node https://api.thegraph.com/deploy/ --debug"`

7. Run `yarn graph-build` followed by `yarn deploy-to-new-chain`.

## [](#V3-subgraph-Deployment "V3-subgraph-Deployment")V3-subgraph Deployment:

8. Fork Uniswap`s v3-subgraph.
    
9. Change all network-dependent values in `subgraph.yaml` and remove the graft helper instruction.
    
10. Update pricing constants, factory address, and static token definitions.
    
11. Follow The Graph documentation to deploy the updated subgraph at an endpoint of your choosing in your Graph account.
    

## [](#Optional "Optional")Optional:

12. If you want the new chain to be used in official Uniswap sites (info), open a PR with your changes in the subgraph repo.
    
13. Consider using the optimized subgraph spec provided in the `mainnet-2.0` branch, although it`s currently untested.

