import Model from '@lblod/ember-rdfa-editor/model/model';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { createLogger, Logger } from '../logging-utils';

interface DomSelection {
  anchorNode?: Node;

  focusNode?: Node;

  anchorOffset: number;

  focusOffset: number;
}

export default class ModelSelectionTracker {
  model: Model;
  previousSelection: DomSelection | null = null;
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
    if (this.isSameAsPrevious(currentSelection)) {
      return;
    }
    if (
      !this.model.rootNode.contains(currentSelection.anchorNode) ||
      !this.model.rootNode.contains(currentSelection.focusNode) ||
      (currentSelection.type != 'Caret' &&
        this.model.rootNode === currentSelection.anchorNode &&
        currentSelection.anchorOffset === currentSelection.focusOffset)
    ) {
      return;
    }
    this.previousSelection = {
      anchorOffset: currentSelection.anchorOffset,
      focusNode: currentSelection.focusNode?.cloneNode(),
      anchorNode: currentSelection.anchorNode?.cloneNode(),
      focusOffset: currentSelection.focusOffset,
    };
    this.logger('Dom selection updated, recalculating selection');
    this.model.readSelection();
  };

  isSameAsPrevious(selection: Selection) {
    if (!this.previousSelection) {
      return false;
    }
    return (
      selection.anchorNode === this.previousSelection.anchorNode &&
      selection.focusNode === this.previousSelection.focusNode &&
      selection.anchorOffset === this.previousSelection.anchorOffset &&
      selection.focusOffset === this.previousSelection.focusOffset
    );
  }
}
