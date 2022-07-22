import SetTextPropertyCommand from './set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export default class MakeItalicCommand extends SetTextPropertyCommand<void> {
  arguments: string[] = [];
  name = 'make-italic';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext) {
    super.setTextProperty(
      transaction,
      'italic',
      true,
      transaction.workingCopy.selection
    );
  }
}
