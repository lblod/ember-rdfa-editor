import { z } from 'zod';
export declare const TextVariableSchema: z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"text">;
    defaultValue: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "text";
    source: string;
    defaultValue?: string | undefined;
}, {
    uri: string;
    label: string;
    type: "text";
    source: string;
    defaultValue?: string | undefined;
}>;
export declare const NumberVariableSchema: z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"number">;
    defaultValue: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "number";
    source: string;
    defaultValue?: number | undefined;
}, {
    uri: string;
    label: string;
    type: "number";
    source: string;
    defaultValue?: number | undefined;
}>;
export declare const DateVariableSchema: z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"date">;
    defaultValue: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "date";
    source: string;
    defaultValue?: Date | undefined;
}, {
    uri: string;
    label: string;
    type: "date";
    source: string;
    defaultValue?: Date | undefined;
}>;
export declare const CodelistVariableSchema: z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"codelist">;
    defaultValue: z.ZodOptional<z.ZodString>;
    defaultValueLabel: z.ZodOptional<z.ZodString>;
    codelistUri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "codelist";
    source: string;
    codelistUri: string;
    defaultValue?: string | undefined;
    defaultValueLabel?: string | undefined;
}, {
    uri: string;
    label: string;
    type: "codelist";
    source: string;
    codelistUri: string;
    defaultValue?: string | undefined;
    defaultValueLabel?: string | undefined;
}>;
export declare const LocationVariableSchema: z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"location">;
    defaultValue: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "location";
    source: string;
    defaultValue?: string | undefined;
}, {
    uri: string;
    label: string;
    type: "location";
    source: string;
    defaultValue?: string | undefined;
}>;
export declare const InstructionVariableSchema: z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"instruction">;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "instruction";
    source: string;
}, {
    uri: string;
    label: string;
    type: "instruction";
    source: string;
}>;
export declare const VariableSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"text">;
    defaultValue: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "text";
    source: string;
    defaultValue?: string | undefined;
}, {
    uri: string;
    label: string;
    type: "text";
    source: string;
    defaultValue?: string | undefined;
}>, z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"number">;
    defaultValue: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "number";
    source: string;
    defaultValue?: number | undefined;
}, {
    uri: string;
    label: string;
    type: "number";
    source: string;
    defaultValue?: number | undefined;
}>, z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"date">;
    defaultValue: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "date";
    source: string;
    defaultValue?: Date | undefined;
}, {
    uri: string;
    label: string;
    type: "date";
    source: string;
    defaultValue?: Date | undefined;
}>, z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"codelist">;
    defaultValue: z.ZodOptional<z.ZodString>;
    defaultValueLabel: z.ZodOptional<z.ZodString>;
    codelistUri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "codelist";
    source: string;
    codelistUri: string;
    defaultValue?: string | undefined;
    defaultValueLabel?: string | undefined;
}, {
    uri: string;
    label: string;
    type: "codelist";
    source: string;
    codelistUri: string;
    defaultValue?: string | undefined;
    defaultValueLabel?: string | undefined;
}>, z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"location">;
    defaultValue: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "location";
    source: string;
    defaultValue?: string | undefined;
}, {
    uri: string;
    label: string;
    type: "location";
    source: string;
    defaultValue?: string | undefined;
}>, z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    source: z.ZodString;
} & {
    type: z.ZodLiteral<"instruction">;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
    type: "instruction";
    source: string;
}, {
    uri: string;
    label: string;
    type: "instruction";
    source: string;
}>]>;
export type Variable = z.infer<typeof VariableSchema>;
