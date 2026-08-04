import { z } from 'zod';
export declare const TrafficSignalConceptSchema: z.ZodIntersection<z.ZodObject<{
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
}>]>>;
export type TrafficSignalConcept = z.infer<typeof TrafficSignalConceptSchema>;
