import { type HasMany } from '@warp-drive/legacy/model';
import type MeasureConcept from './measure-concept.ts';
import type TrafficSignal from './traffic-signal.ts';
import type VariableInstance from './variable-instance.ts';
import type TrafficSignalConcept from './traffic-signal-concept.ts';

export default interface MeasureDesign {
  id: string | null;
  uri: string;

  trafficSignals: HasMany<TrafficSignal> | TrafficSignal[];

  measureConcept: MeasureConcept;

  unusedSignalConcepts: HasMany<TrafficSignalConcept> | TrafficSignalConcept[];

  unIncludedSignalConcepts:
    | HasMany<TrafficSignalConcept>
    | TrafficSignalConcept[];

  variableInstances: HasMany<VariableInstance> | VariableInstance[];
}
