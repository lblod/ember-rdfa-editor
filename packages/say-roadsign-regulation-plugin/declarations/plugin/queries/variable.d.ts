import { type Variable } from '../schemas/variable.ts';
type QueryOptions = {
    templateUri?: string;
    type?: Variable['type'];
    abortSignal?: AbortSignal;
};
export declare function queryVariables(endpoint: string, options?: QueryOptions): Promise<({
    uri: string;
    label: string;
    type: "text";
    source: string;
    defaultValue?: string | undefined;
} | {
    uri: string;
    label: string;
    type: "number";
    source: string;
    defaultValue?: number | undefined;
} | {
    uri: string;
    label: string;
    type: "date";
    source: string;
    defaultValue?: Date | undefined;
} | {
    uri: string;
    label: string;
    type: "codelist";
    source: string;
    codelistUri: string;
    defaultValue?: string | undefined;
    defaultValueLabel?: string | undefined;
} | {
    uri: string;
    label: string;
    type: "location";
    source: string;
    defaultValue?: string | undefined;
} | {
    uri: string;
    label: string;
    type: "instruction";
    source: string;
})[]>;
export {};
