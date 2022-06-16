import { Editor } from '../core/editor';
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

export function handleInsertText(editor: Editor, event: InputEvent): void {
  const range = eventTargetRange(editor.state, editor.view.domRoot, event);
  const text = event.data || '';
  if (
    ModelNodeUtils.isPlaceHolder(range.start.parent) ||
    ModelNodeUtils.isPlaceHolder(range.start.parent)
  ) {
    event.preventDefault();
    const extendedRange = ModelRangeUtils.getExtendedToPlaceholder(range);
    editor.executeCommand('insert-text', { range: extendedRange, text }, true);
  } else {
    editor.executeCommand(
      'insert-text',
      {
        range: eventTargetRange(editor.state, editor.view.domRoot, event),
        text,
      },
      false
    );
  }
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
