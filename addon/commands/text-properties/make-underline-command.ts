import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export default class MakeUnderlineCommand extends SetTextPropertyCommand<void> {
  arguments: string[] = [];
  name = 'make-underline';
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext) {
    super.setTextProperty(
      transaction,
      'underline',
      true,
      transaction.workingCopy.selection
    );
  }
}
