import type TrafficSignalConcept from './traffic-signal-concept.ts';

export default interface TrafficSignal {
  id: string | null;
  uri: string;
  designStatus?: string;

  trafficSignalConcept: TrafficSignalConcept;
}
