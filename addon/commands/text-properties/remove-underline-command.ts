import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export default class RemoveUnderlineCommand extends SetTextPropertyCommand<void> {
  name = 'remove-underline';
  canExecute(): boolean {
    return true;
  }
  @logExecute
  execute({ state, dispatch }: CommandContext) {
    const tr = state.createTransaction();
    super.setTextProperty(tr, 'underline', false, state.selection);
    dispatch(tr);
  }
}
