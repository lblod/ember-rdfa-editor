import Component from '@glimmer/component';
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import { type InsertMobilityMeasureTask } from './expanded-measure';
import { PNode } from '@lblod/ember-rdfa-editor';
type Signature = {
    Args: {
        options: RoadsignRegulationPluginOptions;
        content?: MobilityMeasureConcept[];
        isLoading?: boolean;
        insert: InsertMobilityMeasureTask;
        articleNodes: PNode[];
    };
};
export default class RoadSignsTable extends Component<Signature> {
    selected?: string;
    selectRow(id: string): void;
    categories: (measureConcept: MobilityMeasureConcept) => string[];
}
export {};
