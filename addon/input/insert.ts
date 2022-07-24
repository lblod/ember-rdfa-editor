import { Editor } from '../core/editor';
import Controller from '../model/controller';
import ModelNodeUtils from '../model/util/model-node-utils';
import ModelRangeUtils from '../model/util/model-range-utils';
import { eventTargetRange } from './utils';

export function handleInsertLineBreak(editor: Editor, event: InputEvent): void {
  event.preventDefault();
  if (editor.canExecuteCommand('insert-newLi', {})) {
    editor.executeCommand('insert-newLi', {}, true);
  } else {
    editor.executeCommand('insert-newLine', {}, true);
  }
}

export function handleInsertText(
  controller: Controller,
  event: InputEvent
): void {
  controller.perform((tr) => {
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
    } else {
      if (
        tr.currentSelection.lastRange?.sameAs(range) &&
        tr.currentSelection.activeMarks.size !== 0
      ) {
        event.preventDefault();
      }
      tr.commands.insertText({
        range: eventTargetRange(tr.workingCopy, controller.view.domRoot, event),
        text,
      });
    }
  });
}
export function handleInsertListItem(
  editor: Editor,
  event: InputEvent,
  _listType: 'ul' | 'ol'
) {
  event.preventDefault();
  editor.executeCommand(
    'insert-newLi',
    {
      range: eventTargetRange(editor.state, editor.view.domRoot, event),
    },
    true
  );
}
