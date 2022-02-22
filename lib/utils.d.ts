export declare function sleep(ms: number): Promise<unknown>;
export declare function waitFor(conditionFn: () => Promise<boolean>, description?: string, pollInterval?: number): Promise<unknown>;
