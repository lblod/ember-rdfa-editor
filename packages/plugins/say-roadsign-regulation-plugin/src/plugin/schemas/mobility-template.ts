import { z } from 'zod';

export const MobilityTemplateSchema = z.object({
  uri: z.string(),
  value: z.string(),
});

export type MobilityTemplate = z.infer<typeof MobilityTemplateSchema>;
