import Component from '@glimmer/component';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import { type ZonalOrNot } from '#root/plugin/constants.ts';
import { type Task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { PNode } from '@lblod/ember-rdfa-editor';
export type InsertMobilityMeasureTask = Task<void, [
    MobilityMeasureConcept,
    ZonalOrNot,
    boolean,
    number?
]>;
type Signature = {
    Args: {
        concept: MobilityMeasureConcept;
        selectRow: (uri: string) => void;
        insert: InsertMobilityMeasureTask;
        endpoint: string;
        articleNodes: PNode[];
    };
};
type InsertPositionOption = {
    label: string;
    position: 'first' | 'last' | 'custom';
    insertIndex?: number;
};
export default class ExpandedMeasure extends Component<Signature> {
    intl: IntlService;
    zonalityValue?: ZonalOrNot;
    temporalValue?: boolean;
    selectedInsertPosition: InsertPositionOption;
    insertPositionOptionFirst: InsertPositionOption;
    insertPositionOptionLast: InsertPositionOption;
    constructor(owner: unknown, args: Signature['Args']);
    get isPotentiallyZonal(): boolean;
    get insertButtonDisabled(): boolean;
    changeZonality(zonality: ZonalOrNot): void;
    changeTemporality(temporality: 'true' | 'false'): void;
    insert(): import("ember-concurrency").TaskInstance<void>;
    unselectRow(): void;
    get articlesInDocument(): PNode[];
    get insertPositionOptions(): (InsertPositionOption | {
        label: string;
        position: string;
        insertIndex: number;
    })[];
    get insertPositionDropdownTitle(): string;
}
export {};
