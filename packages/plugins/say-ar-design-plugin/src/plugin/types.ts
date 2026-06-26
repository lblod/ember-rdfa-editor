import type { EditorState, PNode } from '@lblod/ember-rdfa-editor';
import type { TransactionCombinatorResult } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import type ArDesign from './models/ar-design.ts';
import type { ArticleInsertPosition } from './utils/article-insert-position.ts';

export type ArticlePosition = { node: PNode; pos: number };

export type InsertPositionOption = {
  label: string;
  value: ArticleInsertPosition;
};

export type ArInsertFunc = (
  arDesign: ArDesign,
  insertPosition: ArticleInsertPosition,
  skipWarnings?: boolean,
) => void;

export type ArDesignOverviewSortField = 'name' | '-name' | 'date' | '-date';
export type Pagination = {
  pageNumber: number;
  pageSize: number;
  sort?: ArDesignOverviewSortField;
  nameFilter?: string;
};

export type DesignInfo = {
  designs: ArDesign[];
  inDocs: Record<string, Promise<number>>;
};

export type ArDesignQuery = (pagination: Pagination) => Promise<DesignInfo>;

export type ProcessDocumentHeadlessly = (
  html: string,
  transactionGenerator: (
    state: EditorState,
  ) => TransactionCombinatorResult<boolean>,
) => string;
