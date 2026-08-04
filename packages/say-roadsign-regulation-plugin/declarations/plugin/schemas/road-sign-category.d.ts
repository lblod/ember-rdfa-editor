import { z } from 'zod';
export declare const RoadSignCategorySchema: z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
}, {
    uri: string;
    label: string;
}>;
export type RoadSignCategory = z.infer<typeof RoadSignCategorySchema>;
