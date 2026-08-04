import { type TransactionMonad } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { type MobilityMeasureConcept } from '../schemas/mobility-measure-concept.ts';
import { type ZonalOrNot } from '../constants.ts';
import { type MobilityMeasureDesign } from '../schemas/mobility-measure-design.ts';
import { type VariableInstance } from '../schemas/variable-instance.ts';
export type InsertPositionArgs = {
    insertFreely: true;
    decisionUri?: string;
} | {
    insertFreely?: false;
    position?: number;
    decisionUri: string;
};
type InsertMeasureArgs = {
    arDesignUri?: string;
    zonality: ZonalOrNot;
    temporal: boolean;
    variables: Record<string, VariableInstance & {
        __rdfaId: string;
    }>;
    templateString: string;
    articleUriGenerator?: () => string;
} & InsertPositionArgs & ({
    measureConcept: MobilityMeasureConcept;
} | {
    measureDesign: MobilityMeasureDesign;
});
export default function insertMeasure({ arDesignUri, zonality, temporal, variables, templateString, articleUriGenerator, ...args }: InsertMeasureArgs): TransactionMonad<boolean>;
export {};
