import { Account } from "@vite/vitejs-accountblock";
export declare class UserAccount extends Account {
    _provider: any;
    _setProvider(provider: any): void;
    balance(tokenId?: string): Promise<string>;
    sendToken(toAddress: string, amount: string, tokenId?: string, data?: string): Promise<import("@vite/vitejs-accountblock/accountBlock").default>;
    receiveAll(): Promise<void>;
}
