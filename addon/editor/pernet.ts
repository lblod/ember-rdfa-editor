import RichNode from '@lblod/marawa/rich-node';

export interface PernetSelectionBlock {
  richNode: RichNode;
  range: Array<number>;
  split?: boolean;
}

export interface PernetSelection {
  selections: Array<PernetSelectionBlock>;
  selectedHighlightRange?: [number, number];
  collapsed?: boolean;
}
