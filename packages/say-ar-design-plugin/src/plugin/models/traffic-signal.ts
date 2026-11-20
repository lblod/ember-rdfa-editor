import type TrafficSignalConcept from '#root/plugin/models/traffic-signal-concept.ts';

export default interface TrafficSignal {
  id: string | null;
  uri: string;
  designStatus?: string;
  position: number;

  trafficSignalConcept: TrafficSignalConcept;
}
