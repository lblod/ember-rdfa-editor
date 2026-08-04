import { z } from 'zod';
export declare const MobilityTemplateSchema: z.ZodObject<{
    uri: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uri: string;
    value: string;
}, {
    uri: string;
    value: string;
}>;
export type MobilityTemplate = z.infer<typeof MobilityTemplateSchema>;
