import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import { AttributeSpec } from '@lblod/ember-rdfa-editor/model/mark';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import {
  MisbehavedSelectionError,
  ModelError,
} from '@lblod/ember-rdfa-editor/utils/errors';

export interface RemoveMarkFromSelectionCommandArgs {
  markName: string;
  markAttributes: AttributeSpec;
}

export default class RemoveMarkFromSelectionCommand
  implements Command<RemoveMarkFromSelectionCommandArgs, void>
{
  name = 'remove-mark-from-selection';

  canExecute(): boolean {
    return true;
  }
  execute(
    { state, dispatch }: CommandContext,
    { markName, markAttributes }: RemoveMarkFromSelectionCommandArgs
  ): void {
    const selection = state.selection;
    const tr = state.createTransaction();
    if (selection.isCollapsed) {
      tr.removeMarkFromSelection(markName);
      // TODO
      // this.model.rootNode.focus();
      // this.model.emitSelectionChanged();
    } else {
      const spec = state.marksRegistry.lookupMark(markName);
      if (!ModelSelection.isWellBehaved(selection)) {
        throw new MisbehavedSelectionError();
      }
      if (spec) {
        tr.removeMark(selection.lastRange, spec, markAttributes);
      } else {
        throw new ModelError(`Unrecognized mark: ${markName}`);
      }
    }
    dispatch(tr);
  }
}
