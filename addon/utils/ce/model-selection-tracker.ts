import Model from '@lblod/ember-rdfa-editor/model/model';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { createLogger, Logger } from '../logging-utils';

export default class ModelSelectionTracker {
  model: Model;
  logger: Logger;

  constructor(model: Model) {
    this.model = model;
    this.logger = createLogger(this.constructor.name);
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
    this.logger('Dom selection updated, recalculating selection');
    this.model.readSelection();
  };
}
