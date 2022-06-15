import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export default class RemoveStrikethroughCommand extends SetTextPropertyCommand<void> {
  name = 'remove-strikethrough';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ state, dispatch }: CommandContext) {
    const tr = state.createTransaction();
    super.setTextProperty(tr, 'strikethrough', false, state.selection);
    dispatch(tr);
  }
}
