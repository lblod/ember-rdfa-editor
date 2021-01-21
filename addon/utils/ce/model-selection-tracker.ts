import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";


export default class ModelSelectionTracker {
  model: Model;

  constructor(model: Model) {
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
    if (!this.model.rootNode.contains(currentSelection.anchorNode) || !this.model.rootNode.contains(currentSelection.focusNode) ||
      (currentSelection.type != 'Caret' && this.model.rootNode === currentSelection.anchorNode && (currentSelection.anchorOffset === currentSelection.focusOffset))) {
      this.model.selection.clearRanges();
      return;
    }
    this.model.readSelection();
    const modelSelectionUpdatedEvent = new CustomEvent<ModelSelection>(
      'richSelectionUpdated',
      {detail: this.model.selection}
    );
    document.dispatchEvent(modelSelectionUpdatedEvent);
  }
}

// if (currentSelection.type != 'Caret' && currentSelection.focusNode !== this.model.rootNode && currentSelection.focusOffset === 0 && currentSelection.anchorNode) {
//   const previousFocus = currentSelection.focusNode?.previousSibling;
//   if (previousFocus) {
//     let offset;
//     if (isTextNode(previousFocus)) {
//       offset = previousFocus.length;
//     } else {
//       offset = previousFocus.childNodes.length;
//     }
//     currentSelection.setBaseAndExtent(currentSelection.anchorNode, currentSelection.anchorOffset, previousFocus, offset);
//   }
//
// }
// if (!this.model.rootNode.contains(currentSelection.anchorNode) || !this.model.rootNode.contains(currentSelection.focusNode) ||
//   (currentSelection.type != 'Caret' && this.model.rootNode === currentSelection.anchorNode && (currentSelection.anchorOffset === currentSelection.focusOffset))) {
//   return;
// }
// if (!currentSelection.anchorNode || !currentSelection.focusNode) {
//   currentSelection.collapse(this.model.rootNode, 0);
//   return;
// }
//
//
// if (!isTextNode(currentSelection.anchorNode) || !isTextNode(currentSelection.focusNode)) {
//   let anchor = currentSelection.anchorNode;
//   let focus = currentSelection.focusNode;
//   let anchorOffset = currentSelection.anchorOffset;
//   let focusOffset = currentSelection.focusOffset;
//
//   const reverse = this.isReverseSelection(currentSelection);
//   if (!isTextNode(anchor)) {
//     const {
//       textNode,
//       offset
//     } = this.ensureTextNode(anchor, currentSelection.anchorOffset, reverse ? 'focus' : 'anchor');
//     anchor = textNode;
//     anchorOffset = offset;
//   }
//   if (!isTextNode(focus)) {
//     const {
//       textNode,
//       offset
//     } = this.ensureTextNode(focus, currentSelection.focusOffset, reverse ? 'anchor' : 'focus');
//     focus = textNode;
//     focusOffset = offset;
//   }
//
//   currentSelection.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset);
//   return;

// }
