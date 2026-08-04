import { z } from 'zod';
export declare const TrafficSignalCodeSchema: z.ZodObject<{
    uri: z.ZodString;
    label: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uri: string;
    label: string;
}, {
    uri: string;
    label: string;
}>;
export type TrafficSignalCode = z.infer<typeof TrafficSignalCodeSchema>;
