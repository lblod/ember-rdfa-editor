type QueryOptions = {
    imageBaseUrl?: string;
    measureConceptUri: string;
    abortSignal?: AbortSignal;
};
export declare function queryTrafficSignalConcepts(endpoint: string, options: QueryOptions): Promise<(({
    uri: string;
    code: string;
    image: string;
    position: number;
    regulatoryNotation?: string | undefined;
} & {
    type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept" | "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept";
}) | {
    categories: {
        uri: string;
        label: string;
    }[];
    uri: string;
    code: string;
    image: string;
    position: number;
    regulatoryNotation?: string | undefined;
    type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept";
})[]>;
export {};
