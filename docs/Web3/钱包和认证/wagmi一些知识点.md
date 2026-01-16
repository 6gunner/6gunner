### wagmi里的useClient和useConnectorClient的区别？

useClient 用来获取viem的client实例，可以处理一些普通的（获取链上数据，查询缓存等等）

useConnectorClient  默认从当前的connector上获取一个viem client，需要先连上这个connector对应的网络；





### `JsonRPCSigner.connectUnchecked`的作用？



### 为什么我用etherjs和合约交互，网络变化时会出现`underlyer network change error`，而wagmi里可以随时监听网络变化，调用合约交互，不会出现上述错误？ 

有问题的写法：useMultiRewardCallContract用的是我在zkbridge-frontend-lib里export的useContract hook。但是这个hook只能保证每次hook重新执行时拿到的contract是对的。

```typescript
export const useContract = <T extends ethers.Contract = ethers.Contract>(
  contractAddress: string,
  abi: ethers.ContractInterface,
): ContractPair<T> => {
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  return React.useMemo(() => {
    if (!provider) {
      return [undefined, undefined] as unknown as ContractPair<T>;
    }
    const contract = new ethers.Contract(contractAddress, abi, provider) as T;
    let contractWithSigner: T | undefined;
    if (signer) {
      contractWithSigner = contract.connect(signer) as T;
    }
    return [contract, contractWithSigner];
  }, [contractAddress, abi, provider, signer]);
};
```



```tsx
const multiCallContract = useMultiRewardCallContract();

const handleClaim = async () => {
    if (isNetworkError) {
      await switchNetwork();
    }
    try {
      if (multiCallContract && multiCalls) {
        toggle();
        update({ showBonus: false });
        const curChainMultiCalls = multiCalls.filter(m => m[2] === chainId).map(m => [m[0], m[1]]);
        const [, w] = multiCallContract;
        const tx = await w!.claim(curChainMultiCalls);
        await tx.wait();
        update({ showBonus: true });
        setType('claimed');
        setClaimedType(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      toggle();
    }
  };
```

因为在handleClaim调用时，multiCallContract已经形成闭包了，它的signer的chainId是旧的；因此switchNetwork后，两者不一致，报错；



用wagmi的hooks写法为什么没问题？

```ts
async function sendTransaction2(config, parameters) {
  const { account, chainId, connector, gas: gas_, ...rest } = parameters;
  let client;
  if (typeof account === "object" && account.type === "local")
    client = config.getClient({ chainId });
  else
    client = await getConnectorClient(config, { account, chainId, connector }); // 这里每次重新获取client的
  const { connector: activeConnector } = getAccount(config);
  const gas = await (async () => {
    if (!("data" in parameters) || !parameters.data)
      return void 0;
    if ((connector ?? activeConnector)?.supportsSimulation)
      return void 0;
    if (gas_ === null)
      return void 0;
    if (gas_ === void 0) {
      const action2 = getAction(client, estimateGas, "estimateGas");
      return action2({
        ...rest,
        account,
        chain: chainId ? { id: chainId } : null
      });
    }
    return gas_;
  })();
  const action = getAction(client, sendTransaction, "sendTransaction");
```



因为wagmi内部实现里，每次发送transaction的时候，会根据参数里的chainId来获取client，及时没传chainId也能拿到当前最新的client；因此合约交互不会出现chainId不一致问题；



所以我们在实现业务的时候，如果一定要用ethers的Contract写法，就不能把Contract的获取放在handleClaim方法外

（可以尝试用ref来实现，但是应该需要写一个wait来保证ref.current里contract的signer已经被更新了）

我参考wagmi内部的实现，定义了一个useExecContract hooks，返回了一个function。

核心实现是拿到一个client，然后转成provider，再重新创建contract对象。

```tsx
export function useExecContract<T extends Contract = Contract>(
  address: string,
  ABI: any,
  withSignerIfPossible: boolean,
  chainId?: number,
): any {
  const account = useAccount();
  const config = useConfig();
  const { switchChainAsync } = useSwitchChain();
  // 返回一个函数执行
  return useCallback(
    async (cb: any) => {
      if (!address || !ABI || !account.chainId) {
        return null;
      }
      if (chainId && chainId !== account.chainId) {
        await switchChainAsync({ chainId });
      }
      const client = await getConnectorClient(config, {
        chainId,
      });
      const provider = clientToProvider(client);
      if (!provider) {
        return null;
      }
      const contract = getContract(
        address,
        ABI,
        provider,
        withSignerIfPossible && account.address ? account.address : undefined,
      );
      return cb(contract);
    },
    [ABI, account.address, account.chainId, address, chainId, config, withSignerIfPossible],
  );
}
```



综上：最好用wagmi自带的hooks，如果非要用ethers来包装，就需要参考useExecContract的实现。




useQuery里isLoading和isPending的区别？

isLoading是首次加载才会返回true
isPending是不管是首次还是重新加载都会变成true
isRefetching: 重新获取状态才会变成true