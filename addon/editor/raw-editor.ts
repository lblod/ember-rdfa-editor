import {RichNode} from "@lblod/marawa/node-walker/rich-node";

export interface RawEditorSelection extends Array<number> {

}

export interface InternalSelection {
  startNode: RichNode;
  endNode: RichNode;
}
