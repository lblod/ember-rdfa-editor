import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export default class RemoveBoldCommand extends SetTextPropertyCommand<void> {
  arguments: string[] = [];
  name = 'remove-bold';

  canExecute(): boolean {
    return true;
  }
  @logExecute
  execute({ state, dispatch }: CommandContext) {
    const tr = state.createTransaction();
    super.setTextProperty(tr, 'bold', false, state.selection);
    dispatch(tr);
  }
}
