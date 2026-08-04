type QueryOptions = {
    instructionVariableUri?: string;
    measureConceptUri?: string;
    abortSignal?: AbortSignal;
};
export declare function queryMobilityTemplates(endpoint: string, options?: QueryOptions): Promise<{
    uri: string;
    value: string;
}[]>;
export {};
