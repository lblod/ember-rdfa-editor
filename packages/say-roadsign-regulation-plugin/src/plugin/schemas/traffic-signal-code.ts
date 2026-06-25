import { z } from 'zod';

export const TrafficSignalCodeSchema = z.object({
  uri: z.string(),
  label: z.string(),
});

export type TrafficSignalCode = z.infer<typeof TrafficSignalCodeSchema>;
