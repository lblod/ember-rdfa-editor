import SetTextPropertyCommand from './set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export default class MakeBoldCommand extends SetTextPropertyCommand<void> {
  name = 'make-bold';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext) {
    this.setTextProperty(
      transaction,
      'bold',
      true,
      transaction.workingCopy.selection
    );
  }
}
