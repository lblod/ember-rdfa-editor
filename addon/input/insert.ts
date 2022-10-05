import Controller from '../core/controllers/controller';
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
  event.preventDefault();
  controller.perform((tr) => {
    tr.commands.insertText({
      range: controller.selection.lastRange!,
      text: event.data ?? '',
    });
  });
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
