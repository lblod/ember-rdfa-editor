import { z } from 'zod';
import { type Variable } from './variable.ts';
export declare const VariableInstanceSchema: z.ZodUnion<[z.ZodObject<{
    uri: z.ZodString;
    __rdfaId: z.ZodOptional<z.ZodString>;
} & {
    value: z.ZodOptional<z.ZodString>;
    variable: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "text";
        source: string;
        defaultValue?: string | undefined;
    };
    value?: string | undefined;
    __rdfaId?: string | undefined;
}, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "text";
        source: string;
        defaultValue?: string | undefined;
    };
    value?: string | undefined;
    __rdfaId?: string | undefined;
}>, z.ZodObject<{
    uri: z.ZodString;
    __rdfaId: z.ZodOptional<z.ZodString>;
} & {
    value: z.ZodOptional<z.ZodNumber>;
    variable: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "number";
        source: string;
        defaultValue?: number | undefined;
    };
    value?: number | undefined;
    __rdfaId?: string | undefined;
}, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "number";
        source: string;
        defaultValue?: number | undefined;
    };
    value?: number | undefined;
    __rdfaId?: string | undefined;
}>, z.ZodObject<{
    uri: z.ZodString;
    __rdfaId: z.ZodOptional<z.ZodString>;
} & {
    value: z.ZodOptional<z.ZodDate>;
    variable: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "date";
        source: string;
        defaultValue?: Date | undefined;
    };
    value?: Date | undefined;
    __rdfaId?: string | undefined;
}, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "date";
        source: string;
        defaultValue?: Date | undefined;
    };
    value?: Date | undefined;
    __rdfaId?: string | undefined;
}>, z.ZodObject<{
    uri: z.ZodString;
    __rdfaId: z.ZodOptional<z.ZodString>;
} & {
    value: z.ZodOptional<z.ZodString>;
    variable: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "location";
        source: string;
        defaultValue?: string | undefined;
    };
    value?: string | undefined;
    __rdfaId?: string | undefined;
}, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "location";
        source: string;
        defaultValue?: string | undefined;
    };
    value?: string | undefined;
    __rdfaId?: string | undefined;
}>, z.ZodObject<{
    uri: z.ZodString;
    __rdfaId: z.ZodOptional<z.ZodString>;
} & {
    value: z.ZodOptional<z.ZodString>;
    valueLabel: z.ZodOptional<z.ZodString>;
    variable: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "codelist";
        source: string;
        codelistUri: string;
        defaultValue?: string | undefined;
        defaultValueLabel?: string | undefined;
    };
    value?: string | undefined;
    __rdfaId?: string | undefined;
    valueLabel?: string | undefined;
}, {
    uri: string;
    variable: {
        uri: string;
        label: string;
        type: "codelist";
        source: string;
        codelistUri: string;
        defaultValue?: string | undefined;
        defaultValueLabel?: string | undefined;
    };
    value?: string | undefined;
    __rdfaId?: string | undefined;
    valueLabel?: string | undefined;
}>]>;
export type VariableInstance = z.infer<typeof VariableInstanceSchema>;
export declare function isVariableInstance(variableOrVariableInstance: Variable | VariableInstance): variableOrVariableInstance is VariableInstance;
