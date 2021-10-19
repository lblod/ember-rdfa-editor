import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/archive/utils/dom-helpers";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";
import {HtmlModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import {SelectionChangedEvent} from "@lblod/ember-rdfa-editor/core/editor-events";

export default class ModelSelectionTracker {
  model: HtmlModel;
  private eventBus: EventBus;

  constructor(model: HtmlModel, eventBus: EventBus) {
    this.model = model;
    this.eventBus = eventBus;
  }

  startTracking() {
    document.addEventListener('selectionchange', this.updateSelection);
  }

  stopTracking() {
    document.removeEventListener('selectionchange', this.updateSelection);
  }

  updateSelection = () => {
    const currentSelection = getWindowSelection();
    if (!this.model.viewRoot.contains(currentSelection.anchorNode) || !this.model.viewRoot.contains(currentSelection.focusNode) ||
      (currentSelection.type != 'Caret' && this.model.viewRoot === currentSelection.anchorNode && (currentSelection.anchorOffset === currentSelection.focusOffset))) {
      // this.model.selection.clearRanges();
      return;
    }
    this.model.readSelection();
    const modelSelectionUpdatedEvent = new CustomEvent<ModelSelection>(
      'richSelectionUpdated',
      {detail: this.model.selection}
    );
    document.dispatchEvent(modelSelectionUpdatedEvent);
    const event = new SelectionChangedEvent(this.model.selection);
    console.log("Setsize:", event.payload.parentDataset.size);
    this.eventBus.emitDebounced(100, event);
  };
}
