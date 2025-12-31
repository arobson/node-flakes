export declare function getBigIntIdProvider(nodeIdentifier?: string): () => bigint;
export declare function getBase62Provider(nodeIdentifier?: string): () => string;
export declare function getBase36Provider(nodeIdentifier: string): () => string;
export declare function getBigIntIdProviderWithNodeId(nodeIdentifier: bigint): () => bigint;
export declare function bigIntTo62(num: bigint): string;
export declare function bigIntTo36(num: bigint): string;
