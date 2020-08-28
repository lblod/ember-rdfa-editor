export interface RawEditor {
  getRichNodeFor( node: Node ): RichNode
  externalDomUpdate: ( description: string, action: () => void ) => void
  currentPosition: number
  setCurrentPosition: (position: number) => void
  generateDiffEvents: Task,
  setCaret: ( node: Node, position: number ) => void
  setPosition: ( position: number ) => void
  updateRichNode(): () => void
  rootNode: Element
  currentSelection: RawEditorSelection
  richNode: RichNode
  currentNode: Node
  updateSelectionAfterComplexInput: () => void
}


export interface RawEditorSelection extends Array<number> {

}

export interface RichNode {
  start: number;
}

interface Task {
  perform: () => void;
}
