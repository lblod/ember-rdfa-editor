import { z } from 'zod';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../constants.ts';
import { RoadSignCategorySchema } from './road-sign-category.ts';
import { InstructionSchema } from './instruction.ts';

export const TrafficSignalConceptSchema = z
  .object({
    uri: z.string(),
    code: z.string(),
    regulatoryNotation: z.string().optional(),
    image: z.string(),
    position: z.coerce.number().default(-1),
    instructions: z.array(InstructionSchema).default([]),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN),
        categories: z.array(RoadSignCategorySchema).default([]),
        mainSigns: z.array(z.string()).default([]),
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
