import Model from '@lblod/ember-rdfa-editor/model/model';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

export default class ModelSelectionTracker {
  model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  startTracking() {
    document.addEventListener('selectionchange', this.updateSelection);
  }

  stopTracking() {
    document.removeEventListener('selectionchange', this.updateSelection);
  }

  updateSelection = () => {
    const currentSelection = getWindowSelection();
    if (
      !this.model.rootNode.contains(currentSelection.anchorNode) ||
      !this.model.rootNode.contains(currentSelection.focusNode) ||
      (currentSelection.type != 'Caret' &&
        this.model.rootNode === currentSelection.anchorNode &&
        currentSelection.anchorOffset === currentSelection.focusOffset)
    ) {
      return;
    }
    this.model.readSelection();
  };
}
