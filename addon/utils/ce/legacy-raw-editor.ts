import RawEditor from "./raw-editor";
import {taskFor} from "ember-concurrency-ts";
import {InternalSelection, RawEditorSelection, RichNode} from "@lblod/ember-rdfa-editor/editor/raw-editor";


/**
 * Compatibility layer for components still using the Pernet API
 */
export default class LegacyRawEditor extends RawEditor {
  private _currentSelection?: InternalSelection;

  /**
   * the current selection in the editor
   *
   * @property currentSelection
   * @type Array
   * @protected
   */
  // @ts-ignore
  get currentSelection(): RawEditorSelection {
    if (this._currentSelection)
      return [this._currentSelection.startNode.absolutePosition, this._currentSelection.endNode.absolutePosition];
    else
      return [0, 0];
  }

  // @ts-ignore
  set currentSelection({startNode, endNode}: InternalSelection) {
    const oldSelection = this._currentSelection;
    this._currentSelection = {startNode, endNode};
    if (startNode.absolutePosition === endNode.absolutePosition) {
      this.moveCaretInTextNode(startNode.domNode, startNode.relativePosition);
      this.currentNode = startNode.domNode;
    } else {
      this.currentNode = null;
    }

    if (!oldSelection || (
      oldSelection.startNode.domNode != startNode.domNode ||
      oldSelection.startNode.absolutePosition != startNode.absolutePosition ||
      oldSelection.endNode.domNode != endNode.domNode ||
      oldSelection.endNode.absolutePosition != endNode.absolutePosition
    )) {
      for (const obs of this.movementObservers) {
        obs.handleMovement(this, oldSelection, {startNode, endNode});
      }
      taskFor(this.generateDiffEvents).perform();
    }
  }

  /**
   * the start of the current range
   *
   * @property currentPosition
   * @type number
   * @protected
   */
  get currentPosition() {
    return this.currentSelection[0];
  }
}
