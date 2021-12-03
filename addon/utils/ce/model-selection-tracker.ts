import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import EventBus from "@lblod/ember-rdfa-editor/utils/event-bus";
import {SelectionChangedEvent} from "@lblod/ember-rdfa-editor/utils/editor-event";
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/model/util/constants";

export default class ModelSelectionTracker {
  model: Model;
  eventBus: EventBus;

  constructor(model: Model, eventBus: EventBus) {
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
    if (!this.model.rootNode.contains(currentSelection.anchorNode) || !this.model.rootNode.contains(currentSelection.focusNode) ||
      (currentSelection.type != 'Caret' && this.model.rootNode === currentSelection.anchorNode && (currentSelection.anchorOffset === currentSelection.focusOffset))) {
      // this.model.selection.clearRanges();
      return;
    }
    this.model.readSelection();
    this.eventBus.emitDebounced(500, new SelectionChangedEvent({owner: CORE_OWNER, payload: this.model.selection}));
    const modelSelectionUpdatedEvent = new CustomEvent<ModelSelection>(
      'richSelectionUpdated',
      {detail: this.model.selection}
    );
    document.dispatchEvent(modelSelectionUpdatedEvent);
  };
}
