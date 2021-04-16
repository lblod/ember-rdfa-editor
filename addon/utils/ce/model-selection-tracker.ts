import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import ModelTreeWalker, {FilterResult} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import nodeWalker from "./node-walker";

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
      // this.model.selection.clearRanges();
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
