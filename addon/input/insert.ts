import Controller from '../model/controller';
import ModelNodeUtils from '../model/util/model-node-utils';
import ModelRangeUtils from '../model/util/model-range-utils';
import { eventTargetRange } from './utils';

export function handleInsertLineBreak(
  controller: Controller,
  event: InputEvent
): void {
  controller.perform((tr) => {
    event.preventDefault();
    if (tr.commands.insertNewLi.canExecute({})) {
      tr.commands.insertNewLi({});
    } else {
      tr.commands.insertNewLine({});
    }
  });
}

export function handleInsertText(
  controller: Controller,
  event: InputEvent
): void {
  const tr = controller.createTransaction();
  const range = eventTargetRange(
    tr.workingCopy,
    controller.view.domRoot,
    event
  );
  const text = event.data || '';
  if (
    ModelNodeUtils.isPlaceHolder(range.start.parent) ||
    ModelNodeUtils.isPlaceHolder(range.start.parent)
  ) {
    event.preventDefault();
    const extendedRange = ModelRangeUtils.getExtendedToPlaceholder(range);
    tr.commands.insertText({ range: extendedRange, text });
    controller.dispatchTransaction(tr);
  } else {
    if (
      tr.currentSelection.lastRange?.sameAs(range) &&
      tr.currentSelection.activeMarks.size !== 0
    ) {
      event.preventDefault();
      tr.commands.insertText({
        range: eventTargetRange(tr.workingCopy, controller.view.domRoot, event),
        text,
      });
      controller.dispatchTransaction(tr);
    } else {
      tr.commands.insertText({
        range: eventTargetRange(tr.workingCopy, controller.view.domRoot, event),
        text,
      });
      controller.dispatchTransaction(tr, false);
    }
  }
}
export function handleInsertListItem(
  controller: Controller,
  event: InputEvent,
  _listType: 'ul' | 'ol'
) {
  event.preventDefault();
  controller.perform((tr) => {
    tr.commands.insertNewLi({
      range: eventTargetRange(tr.workingCopy, controller.view.domRoot, event),
    });
  });
}
