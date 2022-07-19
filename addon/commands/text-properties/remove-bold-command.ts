import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export default class RemoveBoldCommand extends SetTextPropertyCommand<void> {
  name = 'remove-bold';

  canExecute(): boolean {
    return true;
  }
  @logExecute
  execute({ transaction }: CommandContext) {
    super.setTextProperty(
      transaction,
      'bold',
      false,
      transaction.workingCopy.selection
    );
  }
}
