import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export interface RemoveHighlightCommandArgs {
  selection?: ModelSelection;
}
export default class RemoveHighlightCommand extends SetTextPropertyCommand<RemoveHighlightCommandArgs> {
  name = 'remove-highlight';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { selection = state.selection }: RemoveHighlightCommandArgs
  ) {
    const tr = state.createTransaction();
    this.setTextProperty(tr, 'highlighted', false, selection);
    dispatch(tr);
  }
}
