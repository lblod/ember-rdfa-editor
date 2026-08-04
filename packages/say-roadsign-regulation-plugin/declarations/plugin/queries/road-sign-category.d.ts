type QueryOptions = {
    abortSignal?: AbortSignal;
    roadSignConceptUri?: string;
};
export default function queryRoadSignCategories(endpoint: string, options?: QueryOptions): Promise<{
    uri: string;
    label: string;
}[]>;
export {};
