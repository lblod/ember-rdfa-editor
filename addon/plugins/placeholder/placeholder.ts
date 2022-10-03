import { deleteTargetRange } from '@lblod/ember-rdfa-editor/input/utils';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import ModelRangeUtils from '@lblod/ember-rdfa-editor/utils/model-range-utils';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';

export default class PlaceHolderPlugin implements EditorPlugin {
  controller!: Controller;

  get name() {
    return 'placeholder';
  }

  initialize(
    _transaction: Transaction,
    _controller: Controller,
    _options: unknown
  ): Promise<void> {
    this.controller = _controller;
    return Promise.resolve();
  }

  handleEvent(event: InputEvent) {
    switch (event.inputType) {
      case 'deleteContentBackward':
        return this.handleDelete(event, -1);
      case 'deleteContentForward':
        return this.handleDelete(event, 1);
      case 'insertText':
        return this.handleInsertText(event);
      default:
        return { handled: false };
    }
  }

  handleDelete(event: InputEvent, direction: number) {
    const range = deleteTargetRange(this.controller.currentState, direction);
    if (
      ModelNodeUtils.isPlaceHolder(range.start.parent) ||
      ModelNodeUtils.isPlaceHolder(range.end.parent)
    ) {
      event.preventDefault();
      const extendedRange = ModelRangeUtils.getExtendedToPlaceholder(range);
      this.controller.perform((tr) => {
        tr.commands.insertText({ range: extendedRange, text: INVISIBLE_SPACE });
      });
      event.preventDefault();
      return { handled: true };
    }
    return { handled: false };
  }

  handleInsertText(event: InputEvent) {
    const originalRange = this.controller.selection.lastRange!;
    const text = event.data;

    if (
      text &&
      (ModelNodeUtils.isPlaceHolder(originalRange.start.parent) ||
        ModelNodeUtils.isPlaceHolder(originalRange.end.parent))
    ) {
      const range = ModelRangeUtils.getExtendedToPlaceholder(originalRange);
      event.preventDefault();
      this.controller.perform((tr) => {
        tr.commands.insertText({ text, range });
      });
      return { handled: true };
    }
    return { handled: false };
  }
}
