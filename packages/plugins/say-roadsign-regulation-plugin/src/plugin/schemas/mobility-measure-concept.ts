import { ZONALITY_OPTIONS } from '../constants.ts';
import { TrafficSignalConceptSchema } from './traffic-signal-concept.ts';
import { z } from 'zod';

export const MobilityMeasureConceptSchema = z.object({
  uri: z.string(),
  label: z.string(),
  preview: z.string(),
  zonality: z.nativeEnum(ZONALITY_OPTIONS),
  variableSignage: z.boolean().default(false),
  trafficSignalConcepts: z.array(TrafficSignalConceptSchema).default([]),
});

export type MobilityMeasureConcept = z.infer<
  typeof MobilityMeasureConceptSchema
>;
