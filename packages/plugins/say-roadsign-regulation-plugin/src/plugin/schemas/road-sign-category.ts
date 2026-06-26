import { z } from 'zod';

export const RoadSignCategorySchema = z.object({
  uri: z.string(),
  label: z.string(),
});

export type RoadSignCategory = z.infer<typeof RoadSignCategorySchema>;
