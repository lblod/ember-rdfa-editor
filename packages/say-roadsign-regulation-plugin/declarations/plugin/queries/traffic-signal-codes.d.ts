type QueryOptions = {
    searchString?: string;
    roadSignCategory?: string;
    types?: string | string[];
    combinedWith?: string | string[];
    abortSignal?: AbortSignal;
};
export default function queryTrafficSignalCodes(endpoint: string, options?: QueryOptions): Promise<{
    uri: string;
    label: string;
}[]>;
export {};
