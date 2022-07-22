import SetTextPropertyCommand from './set-text-property-command';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';
export interface MakeHighlightCommandArgs {
  selection?: ModelSelection;
}

export default class MakeHighlightCommand extends SetTextPropertyCommand<MakeHighlightCommandArgs> {
  arguments: string[] = [];
  name = 'make-highlight';
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { selection = transaction.workingCopy.selection }: MakeHighlightCommandArgs
  ) {
    this.setTextProperty(transaction, 'highlighted', true, selection);
  }
}
