import { deleteTargetRange } from '@lblod/ember-rdfa-editor/input/utils';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';

export default class TablePlugin implements EditorPlugin {
  controller!: Controller;

  get name() {
    return 'table';
  }

  initialize(
    _transaction: Transaction,
    _controller: Controller,
    _options: unknown
  ): Promise<void> {
    this.controller = _controller;
    return Promise.resolve();
  }

  handleEvent(event: InputEvent): { handled: boolean } {
    switch (event.inputType) {
      case 'deleteContentBackward':
        return this.handleDelete(event, -1);
      case 'deleteContentForward':
        return this.handleDelete(event, 1);
      default:
        return { handled: false };
    }
  }

  handleDelete(event: InputEvent, direction: number) {
    const range = deleteTargetRange(this.controller.currentState, direction);

    const startCell =
      range.start.parent.findSelfOrAncestors(ModelNodeUtils.isTableCell).next()
        .value || null;
    const endCell =
      range.end.parent.findSelfOrAncestors(ModelNodeUtils.isTableCell).next()
        .value || null;
    if (!startCell && !endCell) {
      return { handled: false };
    }
    if (startCell && endCell && startCell === endCell) {
      this.controller.perform((tr) => {
        tr.commands.remove({ range });
      });
      return { handled: true };
    } else {
      event.preventDefault();
      return { handled: true };
    }
  }
}
