import type { EditorState, PNode } from '@lblod/ember-rdfa-editor';
import type { TransactionCombinatorResult } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import type ArDesign from '#root/plugin/models/ar-design.ts';
import type { ArticleInsertPosition } from '#root/plugin/utils/article-insert-position.ts';
import type TrafficSignalConcept from '#root/plugin/models/traffic-signal-concept.ts';
import type { Variable } from '@lblod/say-roadsign-regulation-plugin/plugin/schemas/variable';
import { tracked } from '@glimmer/tracking';
import type Instruction from '#root/plugin/models/instruction.ts';

export type ArticlePosition = { node: PNode; pos: number };

export type InsertPositionOption = {
  label: string;
  value: ArticleInsertPosition | false;
};

export type ArInsertFunc = (
  arDesign: ArDesign,
  insertPosition: ArticleInsertPosition | false,
) => void;

export type ArDesignOverviewSortField = 'name' | '-name' | 'date' | '-date';
export type Pagination = {
  pageNumber: number;
  pageSize: number;
  sort?: ArDesignOverviewSortField;
  nameFilter?: string;
};

export type DesignInfo = {
  /** the designs themselves */
  designs: ArDesign[];
  /**
   * for each design, a promise resolving to the number of documents this design is used in
   * (indexed by id)
   */
  inDocs: Record<string, Promise<number>>;
};

export type ArDesignQuery = (pagination: Pagination) => Promise<DesignInfo>;

export type InstructionVariableQuery = (uri: string) => Promise<Variable[]>;

export type ProcessDocumentHeadlessly = (
  html: string,
  transactionGenerator: (
    state: EditorState,
  ) => TransactionCombinatorResult<boolean>,
) => string;

export class SignWithInstruction {
  readonly sign: TrafficSignalConcept;
  readonly position: number;

  // Nested reactivity so we don't have to rebuild the map on every instruction change
  @tracked selectedInstruction?: Instruction;

  constructor(sign: TrafficSignalConcept, position: number) {
    this.sign = sign;
    this.position = position;
    //If the sign has only one instruction we should autoselect it
    if (sign.instructions.length === 1) {
      this.selectedInstruction = sign.instructions[0];
    }
  }
}

export type MainSignWithInstruction = {
  mainSign: SignWithInstruction;
  subSigns: SignWithInstruction[];
};
