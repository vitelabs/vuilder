import { accountBlock } from "@vite/vitejs";
export declare class UserAccount extends accountBlock.Account {
    constructor(address: string, provider: any);
    balance(tokenId?: string): Promise<string>;
    sendToken(toAddress: string, amount: string, tokenId?: string, data?: string): Promise<any>;
    receiveAll(): Promise<void>;
}
