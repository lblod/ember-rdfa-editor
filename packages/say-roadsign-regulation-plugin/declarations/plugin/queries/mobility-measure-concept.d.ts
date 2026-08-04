import { ZONALITY_OPTIONS } from '../constants.ts';
type QueryOptions<Count extends boolean = boolean> = {
    imageBaseUrl?: string;
    searchString?: string;
    zonality?: (typeof ZONALITY_OPTIONS)[keyof typeof ZONALITY_OPTIONS];
    trafficSignalType?: string;
    codes?: string[];
    category?: string;
    page?: number;
    pageSize?: number;
    abortSignal?: AbortSignal;
    count: Count;
};
export type MobilityMeasureQueryOptions = Omit<QueryOptions, 'count'>;
export declare function queryMobilityMeasures(endpoint: string, options?: MobilityMeasureQueryOptions): Promise<{
    uri: string;
    label: string;
    preview: string;
    zonality: "http://register.mobiliteit.vlaanderen.be/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f" | "http://register.mobiliteit.vlaanderen.be/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d" | "http://register.mobiliteit.vlaanderen.be/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc";
    variableSignage: boolean;
    trafficSignalConcepts: ({
        uri: string;
        code: string;
        image: string;
        position: number;
        regulatoryNotation?: string | undefined;
    } & ({
        type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept";
        categories: {
            uri: string;
            label: string;
        }[];
    } | {
        type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept" | "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept";
    }))[];
}[]>;
export type MobilityMeasureCountOptions = Omit<QueryOptions, 'count' | 'page' | 'pageSize'>;
export declare function countMobilityMeasures(endpoint: string, options?: MobilityMeasureCountOptions): Promise<number>;
export {};
