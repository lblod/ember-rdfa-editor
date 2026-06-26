import { z } from 'zod';
import {
  type TrafficSignalConcept,
  TrafficSignalConceptSchema,
} from './traffic-signal-concept.ts';

export const TrafficSignalSchema = z.object({
  uri: z.string(),
  trafficSignalConcept: TrafficSignalConceptSchema,
});

export type TrafficSignal = z.infer<typeof TrafficSignalSchema>;

export function isTrafficSignal(
  signalOrSignalConcept: TrafficSignal | TrafficSignalConcept,
): signalOrSignalConcept is TrafficSignal {
  return 'trafficSignalConcept' in signalOrSignalConcept;
}
