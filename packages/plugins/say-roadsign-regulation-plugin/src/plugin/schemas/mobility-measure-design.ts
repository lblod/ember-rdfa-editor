import { z } from 'zod';
import { TrafficSignalSchema } from './traffic-signal.ts';
import {
  type MobilityMeasureConcept,
  MobilityMeasureConceptSchema,
} from './mobility-measure-concept.ts';
import { TrafficSignalConceptSchema } from './traffic-signal-concept.ts';

export const MobilityMeasureDesignSchema = z.object({
  uri: z.string(),
  trafficSignals: z.union([
    z.array(TrafficSignalSchema),
    z.array(TrafficSignalConceptSchema),
  ]),
  measureConcept: MobilityMeasureConceptSchema,
});

export type MobilityMeasureDesign = z.infer<typeof MobilityMeasureDesignSchema>;

export function isMobilityMeasureDesign(
  conceptOrDesign: MobilityMeasureConcept | MobilityMeasureDesign,
): conceptOrDesign is MobilityMeasureDesign {
  return 'measureConcept' in conceptOrDesign;
}
