import { tracked } from '@glimmer/tracking';
import { type Instruction } from '#root/plugin/schemas/instruction.ts';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';

export class SelectedSign {
  readonly sign: TrafficSignalConcept;

  // Nested reactivity so we don't have to rebuild the map on every instruction change
  @tracked selectedInstruction?: Instruction;

  constructor(sign: TrafficSignalConcept) {
    this.sign = sign;
  }
}

export type MainSignSelection = {
  mainSign: SelectedSign;
  subSigns: Map<string, SelectedSign>;
};

export type SelectedSigns = Map<string, MainSignSelection>;
