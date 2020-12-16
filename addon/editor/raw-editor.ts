
export interface RawEditorSelection extends Array<number> {

}

export interface RichNode {
  start: number;
  end: number;
  type: string;
  domNode: Node;
  parent: RichNode;
  text?: string;
  children?: Array<RichNode>;
  absolutePosition: number;
  relativePosition: number;
}
export interface InternalSelection {
  startNode: RichNode;
  endNode: RichNode;
}
