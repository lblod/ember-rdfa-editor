import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export interface RemoveHighlightCommandArgs {
  selection?: ModelSelection;
}
export default class RemoveHighlightCommand extends SetTextPropertyCommand<RemoveHighlightCommandArgs> {
  arguments: string[] = ['selection'];
  name = 'remove-highlight';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext) {
    super.setTextProperty(
      transaction,
      'highlighted',
      false,
      transaction.workingCopy.selection
    );
  }
}
