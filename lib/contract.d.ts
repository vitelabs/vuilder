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
        responseLatency?: Number;
        quotaMultiplier?: Number;
        randomDegree?: Number;
        params?: string | Array<string | boolean>;
        tokenId?: string;
        amount?: string;
        libraries?: Object;
    }): Promise<this | undefined>;
    call(methodName: string, params: any[], { tokenId, amount, caller }: {
        tokenId?: string;
        amount?: string;
        caller?: any;
    }): Promise<any>;
    link(libraries: Object): void;
    query(methodName: string, params: any[]): Promise<any>;
    height(): Promise<Number>;
    waitForHeight(height: Number): Promise<void>;
    getPastEvents(eventName: string | undefined, { fromHeight, toHeight }: {
        filter?: Object;
        fromHeight?: Number;
        toHeight?: Number;
    }): Promise<any[]>;
    balance(tokenId?: string): Promise<string>;
}
