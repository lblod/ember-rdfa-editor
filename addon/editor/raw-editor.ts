import RichNode from "@lblod/marawa/rich-node";

export type RawEditorSelection = Array<number>;

export interface InternalSelection {
  startNode: RichNode;
  endNode: RichNode;
}
