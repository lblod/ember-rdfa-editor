import { z } from 'zod';
export declare const MobilityMeasureConceptSchema: z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
    preview: z.ZodString;
    zonality: z.ZodNativeEnum<{
        readonly POTENTIALLY_ZONAL: "http://register.mobiliteit.vlaanderen.be/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f";
        readonly ZONAL: "http://register.mobiliteit.vlaanderen.be/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d";
        readonly NON_ZONAL: "http://register.mobiliteit.vlaanderen.be/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc";
    }>;
    variableSignage: z.ZodDefault<z.ZodBoolean>;
    trafficSignalConcepts: z.ZodDefault<z.ZodArray<z.ZodIntersection<z.ZodObject<{
        uri: z.ZodString;
        code: z.ZodString;
        regulatoryNotation: z.ZodOptional<z.ZodString>;
        image: z.ZodString;
        position: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        uri: string;
        code: string;
        image: string;
        position: number;
        regulatoryNotation?: string | undefined;
    }, {
        uri: string;
        code: string;
        image: string;
        regulatoryNotation?: string | undefined;
        position?: number | undefined;
    }>, z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept">;
        categories: z.ZodDefault<z.ZodArray<z.ZodObject<{
            uri: z.ZodString;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            uri: string;
            label: string;
        }, {
            uri: string;
            label: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept";
        categories: {
            uri: string;
            label: string;
        }[];
    }, {
        type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept";
        categories?: {
            uri: string;
            label: string;
        }[] | undefined;
    }>, z.ZodObject<{
        type: z.ZodEnum<["https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept", "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept"]>;
    }, "strip", z.ZodTypeAny, {
        type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept" | "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept";
    }, {
        type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept" | "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept";
    }>]>>, "many">>;
}, "strip", z.ZodTypeAny, {
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
}, {
    uri: string;
    label: string;
    preview: string;
    zonality: "http://register.mobiliteit.vlaanderen.be/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f" | "http://register.mobiliteit.vlaanderen.be/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d" | "http://register.mobiliteit.vlaanderen.be/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc";
    variableSignage?: boolean | undefined;
    trafficSignalConcepts?: ({
        uri: string;
        code: string;
        image: string;
        regulatoryNotation?: string | undefined;
        position?: number | undefined;
    } & ({
        type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept";
        categories?: {
            uri: string;
            label: string;
        }[] | undefined;
    } | {
        type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept" | "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept";
    }))[] | undefined;
}>;
export type MobilityMeasureConcept = z.infer<typeof MobilityMeasureConceptSchema>;
