import { ViteAPI, accountBlock } from "@vite/vitejs";
declare type Provider = InstanceType<typeof ViteAPI>;
declare type Account = InstanceType<typeof accountBlock.Account>;
export declare class Contract {
    provider?: Provider;
    name: string;
    byteCode?: string;
    offchainCode: string;
    abi: any;
    address?: string;
    deployer?: Account;
    constructor(name: string, byteCode: string, abi: any);
    setProvider(provider: Provider): Contract;
    setDeployer(deployer: Account): Contract;
    deploy({ responseLatency, quotaMultiplier, randomDegree, params, tokenId, amount, libraries, }: {
        responseLatency?: Number;
        quotaMultiplier?: Number;
        randomDegree?: Number;
        params?: string | Array<string | boolean>;
        tokenId?: string;
        amount?: string;
        libraries?: Object;
    }): Promise<this | undefined>;
    call(methodName: string, params: any[], { tokenId, amount, caller, }: {
        tokenId?: string;
        amount?: string;
        caller?: Account;
    }): Promise<any>;
    link(libraries: Object): void;
    query(methodName: string, params: any[]): Promise<any>;
    height(): Promise<Number>;
    waitForHeight(height: Number): Promise<void>;
    getPastEvents(eventName: string | undefined, { fromHeight, toHeight, }: {
        filter?: Object;
        fromHeight?: Number;
        toHeight?: Number;
    }): Promise<any[]>;
    balance(tokenId?: string): Promise<string>;
}
export {};
