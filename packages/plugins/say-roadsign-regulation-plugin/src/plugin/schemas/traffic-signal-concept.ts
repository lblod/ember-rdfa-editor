import { z } from 'zod';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../constants.ts';
import { RoadSignCategorySchema } from './road-sign-category.ts';

export const TrafficSignalConceptSchema = z
  .object({
    uri: z.string(),
    code: z.string(),
    regulatoryNotation: z.string().optional(),
    image: z.string(),
    position: z.coerce.number().default(-1),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN),
        categories: z.array(RoadSignCategorySchema).default([]),
      }),
      z.object({
        type: z.enum([
          TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
          TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
        ]),
      }),
    ]),
  );

export type TrafficSignalConcept = z.infer<typeof TrafficSignalConceptSchema>;
