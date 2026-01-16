web3-react的Connector Class属性：

```ts
export declare abstract class Connector {
    /**
     * An
     * EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) and
     * EIP-1102 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md}) compliant provider.
     * May also comply with EIP-3085 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3085.md}).
     * This property must be defined while the connector is active, unless a customProvider is provided.
     */
    provider?: Provider;
    /**
     * An optional property meant to allow ethers providers to be used directly rather than via the experimental
     * 1193 bridge. If desired, this property must be defined while the connector is active, in which case it will
     * be preferred over provider.
     */
    customProvider?: unknown;
    protected readonly actions: Actions;
    /**
     * An optional handler which will report errors thrown from event listeners. Any errors caused from
     * user-defined behavior will be thrown inline through a Promise.
     */
    protected onError?: (error: Error) => void;
    /**
     * @param actions - Methods bound to a zustand store that tracks the state of the connector.
     * @param onError - An optional handler which will report errors thrown from event listeners.
     * Actions are used by the connector to report changes in connection status.
     */
    constructor(actions: Actions, onError?: (error: Error) => void);
    /**
     * Reset the state of the connector without otherwise interacting with the connection.
     */
    resetState(): Promise<void> | void;
    /**
     * Initiate a connection.
     */
    abstract activate(...args: unknown[]): Promise<void> | void;
    /**
     * Attempt to initiate a connection, failing silently
     */
    connectEagerly?(...args: unknown[]): Promise<void> | void;
    /**
     * Un-initiate a connection. Only needs to be defined if a connection requires specific logic on disconnect.
     */
    deactivate?(...args: unknown[]): Promise<void> | void;
    /**
     * Attempt to add an asset per EIP-747.
     */
    watchAsset?(params: WatchAssetParameters): Promise<true>;
}
```



useDapp的Connector定义

```ts
export interface Connector {
  provider?: providers.Web3Provider | providers.JsonRpcProvider

  name: string

  update: ReadOnlyEvent<ConnectorUpdateData>

  connectEagerly(): Promise<void>

  activate(): Promise<void>

  deactivate(): Promise<void>
}
```

