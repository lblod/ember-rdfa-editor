import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export default class RemoveItalicCommand extends SetTextPropertyCommand<void> {
  arguments: string[] = [];
  name = 'remove-italic';
  canExecute(): boolean {
    return true;
  }
  @logExecute
  execute({ state, dispatch }: CommandContext) {
    const tr = state.createTransaction();
    super.setTextProperty(tr, 'italic', false, state.selection);
    dispatch(tr);
  }
}
