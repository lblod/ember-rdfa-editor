import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";


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
    this.model.readSelection();
    const modelSelectionUpdatedEvent = new CustomEvent<ModelSelection>(
      'richSelectionUpdated',
      {detail: this.model.selection}
    );
    document.dispatchEvent(modelSelectionUpdatedEvent);
  }
}

