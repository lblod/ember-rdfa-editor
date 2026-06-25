import type RoadSignCategory from './road-sign-category.ts';

export default interface TrafficSignalConcept {
  id: string | null;
  uri: string;
  code: string;
  regulatoryNotation?: string;
  type: string;

  categories: RoadSignCategory[];
}
