import {getWindowSelection, isTextNode, isVoidElement} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import DomNodeFinder from "@lblod/ember-rdfa-editor/model/util/dom-node-finder";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";

export enum PropertyState {
  enabled = 'enabled',
  disabled = 'disabled',
  unknown = 'unknown'
}
export default class ModelSelectionTracker {
  modelSelection: ModelSelection;
  model: Model;
  constructor(model: Model) {
    this.modelSelection = new ModelSelection(model, getWindowSelection()),
    this.model = model;
    this.updateSelection = this.updateSelection.bind(this);
  }
  startTracking() {
    document.addEventListener('selectionchange', this.updateSelection);
  }
  stopTracking() {
    document.removeEventListener('selectionchange', this.updateSelection);
  }
  updateSelection() {
    const currentSelection  = getWindowSelection();
    if(!currentSelection.anchorNode || !currentSelection.focusNode) {
      currentSelection.collapse(this.model.rootNode,0);
      return;
    }
    if(!isTextNode(currentSelection.anchorNode) || !isTextNode(currentSelection.focusNode)) {
      let anchor = currentSelection.anchorNode;
      let focus = currentSelection.focusNode;
      let anchorOffset = currentSelection.anchorOffset;
      let focusOffset = currentSelection.focusOffset;

      if(!isTextNode(anchor)) {
        anchor = this.ensureTextNode(anchor, currentSelection.anchorOffset);
        anchorOffset = 0;
      }
      if(!isTextNode(focus)) {
        focus = this.ensureTextNode(focus, currentSelection.focusOffset);
        focusOffset = 0;
      }
      currentSelection.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset);
      return;
    }

    this.modelSelection.setFromDomSelection(currentSelection);

    const modelSelectionUpdatedEvent = new CustomEvent<ModelSelection>('richSelectionUpdated', {detail:  this.modelSelection});
    document.dispatchEvent(modelSelectionUpdatedEvent);
  }

  private ensureTextNode(node: Node, offset: number): Text {
    let from: Node | null = node.childNodes[offset];

    if(!from){
      from = node.parentNode!;
    }
    let textNode = new DomNodeFinder(
      {startNode: from,
        direction: Direction.FORWARDS,
      rootNode: this.model.rootNode,
      nodeFilter: n => isTextNode(n)
      }
    ).next();

    if(!textNode) {
     textNode = new DomNodeFinder(
       {startNode: from,
         direction: Direction.BACKWARDS,
         rootNode: this.model.rootNode,
         nodeFilter: n => isTextNode(n)
       }
     ).next();
    }
    if (!textNode) {
      throw new SelectionError("Could not ensure textNode");
    }
    return textNode as Text;
  }

}

