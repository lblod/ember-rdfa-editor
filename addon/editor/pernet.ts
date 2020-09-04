import { RichNode } from '@lblod/ember-rdfa-editor/editor/raw-editor'

export interface PernetSelectionBlock {
  richNode: RichNode
  range: Array<number>
  split?: boolean
}

export interface PernetSelection {
  selections: Array<PernetSelectionBlock>
  selectedHighlightRange?: [number, number]
  collapsed?: boolean
}
