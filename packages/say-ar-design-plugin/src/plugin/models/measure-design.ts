import { type HasMany } from '@warp-drive/legacy/model';
import type MeasureConcept from '#root/plugin/models/measure-concept.ts';
import type TrafficSignal from '#root/plugin/models/traffic-signal.ts';
import type VariableInstance from '#root/plugin/models/variable-instance.ts';
import type TrafficSignalConcept from '#root/plugin/models/traffic-signal-concept.ts';

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
