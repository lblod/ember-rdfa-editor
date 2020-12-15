import { TaskGenerator } from 'ember-concurrency';
import Command from '../commands/command';
export interface RawEditor {
  getRichNodeFor( node: Node ): RichNode | null
  externalDomUpdate: ( description: string, action: () => void ) => void
  currentPosition: number | null
  generateDiffEvents: (extraInfo?: Object[]) => TaskGenerator<void>,
  setCaret: ( node: Node, position: number ) => void
  updateRichNode: () => void
  rootNode: Element
  currentSelection: RawEditorSelection
  richNode: RichNode
  currentNode: Node | null
  updateSelectionAfterComplexInput: () => void
  registerCommand: (command: Command) => void
  executeCommand: (commandName: string) => void
}


export interface RawEditorSelection extends Array<number> {

}

export interface RichNode {
  start: number
  end: number
  type: string
  domNode: Node
  parent: RichNode
  text?: string
  children?: Array<RichNode>
}
