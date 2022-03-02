export declare function init({ name, version, type, }: {
    name?: String;
    version: String;
    type?: String;
}): Promise<void>;
export declare function binName(name: String, version: String): string;
export declare function binPath(): string;
export declare class Node {
    httpUrl: string;
    binPath: string;
    binName: string;
    provider?: any;
    constructor(url: string, binPath: string, binName: string);
    start(): Promise<void>;
    isUp: () => Promise<boolean>;
    stop(): Promise<void>;
}
