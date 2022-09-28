import { UserAccount } from "./user";
import * as vnode from "./node";
export declare function startLocalNetwork(cfg: any): Promise<vnode.Node>;
export declare function stopLocalNetworks(): Promise<void>;
export declare function newProvider(url: string): any;
export declare function newAccount(mnemonics: string, index: number, provider: any): UserAccount;
export declare function getSnapshotHeight(provider: any): Promise<any>;
export declare function getAccountHeight(provider: any, to: string): Promise<Number>;
export declare function getQuota(provider: any, to: string): Promise<any>;
export declare function getAccountBlock(provider: any, hash?: string): Promise<any>;
export declare function getBalance(provider: any, address: string, tokenId?: string): Promise<any>;
export declare function isReceived(provider: any, hash?: string): Promise<boolean>;
export declare function isConfirmed(provider: any, hash?: string): Promise<boolean>;
//# sourceMappingURL=vite.d.ts.map