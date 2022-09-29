export declare class Contract {
    provider: any;
    name: string;
    byteCode: string;
    offchainCode: string;
    abi: any;
    address: string | undefined;
    deployer: any;
    constructor(name: string, byteCode: string, abi: any);
    setProvider(provider: any): Contract;
    setDeployer(deployer: any): Contract;
    deploy({ responseLatency, quotaMultiplier, randomDegree, params, tokenId, amount, libraries }: {
        responseLatency?: number;
        quotaMultiplier?: number;
        randomDegree?: number;
        params?: string | Array<string | boolean>;
        tokenId?: string;
        amount?: string;
        libraries?: Object;
    }): Promise<this | undefined>;
    attach(address: string): Promise<void>;
    call(methodName: string, params: any[], { tokenId, amount, caller }: {
        tokenId?: string;
        amount?: string;
        caller?: any;
    }): Promise<any>;
    link(libraries: Object): void;
    query(methodName: string, params: any[]): Promise<any[] | null>;
    height(): Promise<number>;
    waitForHeight(height: number): Promise<void>;
    getPastEvents(eventName: string | undefined, { fromHeight, toHeight }: {
        filter?: Object;
        fromHeight?: number;
        toHeight?: number;
    }): Promise<any[]>;
    balance(tokenId?: string): Promise<string>;
}
//# sourceMappingURL=contract.d.ts.map