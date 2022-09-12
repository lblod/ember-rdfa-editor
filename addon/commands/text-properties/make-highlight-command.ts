import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';
import SetTextPropertyCommand from './set-text-property-command';
declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    makeHighlight: MakeHighlightCommand;
  }
}
export interface MakeHighlightCommandArgs {
  selection?: ModelSelection;
}

export default class MakeHighlightCommand extends SetTextPropertyCommand<MakeHighlightCommandArgs> {
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
