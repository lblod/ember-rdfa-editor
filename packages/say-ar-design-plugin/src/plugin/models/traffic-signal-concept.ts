import type Instruction from '#root/plugin/models/instruction.ts';
import type RoadSignCategory from '#root/plugin/models/road-sign-category.ts';

export default interface TrafficSignalConcept {
  id: string | null;
  uri: string;
  code: string;
  meaning: string;
  regulatoryNotation?: string;
  image: string;
  type: string;

  categories: RoadSignCategory[];
  instructions: Instruction[];
  mainSigns: string[];
}
