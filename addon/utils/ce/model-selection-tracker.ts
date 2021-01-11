import {getWindowSelection, tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
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

function isTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE;
}

export default class ModelSelectionTracker {
  modelSelection: ModelSelection;
  model: Model;

  constructor(model: Model) {
    this.modelSelection = new ModelSelection(model);
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
    const currentSelection = getWindowSelection();
    if(!this.model.rootNode.contains(currentSelection.anchorNode) || (this.model.rootNode === currentSelection.anchorNode && (currentSelection.anchorOffset === currentSelection.focusOffset))) {
      return;
    }
    if (!currentSelection.anchorNode || !currentSelection.focusNode) {
      currentSelection.collapse(this.model.rootNode, 0);
      return;
    }


    if (!isTextNode(currentSelection.anchorNode) || !isTextNode(currentSelection.focusNode)) {
      let anchor = currentSelection.anchorNode;
      let focus = currentSelection.focusNode;
      let anchorOffset = currentSelection.anchorOffset;
      let focusOffset = currentSelection.focusOffset;
      if(!isTextNode(anchor)) {
        const {textNode, offset} = this.ensureTextNode(anchor, currentSelection.anchorOffset, 'anchor');
        anchor = textNode;
        anchorOffset = offset;
      }
      if (!isTextNode(focus)) {
        const {textNode, offset} = this.ensureTextNode(focus, currentSelection.focusOffset, 'focus');
        focus = textNode;
        focusOffset = offset;
      }

      currentSelection.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset);
      return;
    }

    this.modelSelection.setFromDomSelection(currentSelection);

    const modelSelectionUpdatedEvent = new CustomEvent<ModelSelection>('richSelectionUpdated', {detail: this.modelSelection});
    document.dispatchEvent(modelSelectionUpdatedEvent);
  }

  private ensureTextNode(node: Node, offset: number, type: String): { textNode: Text | HTMLBRElement; offset: number } {
    let from: Node | null;
    let direction: Direction;
    if(offset === 0) {
      from = node.childNodes[0];
      direction = Direction.FORWARDS;
    } else if(offset !== node.childNodes.length){
      from = node.childNodes[offset];
      direction = Direction.BACKWARDS;
    }else {
      from = node.childNodes[offset - 1];
      direction = Direction.BACKWARDS;
    }

    if (!from) {
      from = node.parentNode!;
    }
    let textNode = new DomNodeFinder(
      {
        startNode: from,
        direction: direction,
        rootNode: this.model.rootNode,
        nodeFilter: isTextNode
      }
    ).next();

    if (!textNode) {
      textNode = new DomNodeFinder(
        {
          startNode: from,
          direction: direction === Direction.FORWARDS ? Direction.BACKWARDS : Direction.FORWARDS,
          rootNode: this.model.rootNode,
          nodeFilter: isTextNode
        }
      ).next();
    }
    if (!textNode) {
      throw new SelectionError("Could not ensure textNode");
    } else {
      return {
        textNode,
        offset: type === 'anchor' ? 0 : textNode.length
      };
    }
  }

}

