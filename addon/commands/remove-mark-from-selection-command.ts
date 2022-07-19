import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import {
  MisbehavedSelectionError,
  ModelError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { CORE_OWNER } from '../model/util/constants';
import { AttributeSpec } from '../model/util/render-spec';
import { SelectionChangedEvent } from '../utils/editor-event';

export interface RemoveMarkFromSelectionCommandArgs {
  markName: string;
  markAttributes?: AttributeSpec;
}

export default class RemoveMarkFromSelectionCommand
  implements Command<RemoveMarkFromSelectionCommandArgs, void>
{
  name = 'remove-mark-from-selection';
  arguments: string[] = ['markName', 'markAttributes'];

  canExecute(): boolean {
    return true;
  }
  execute(
    { transaction }: CommandContext,
    { markName, markAttributes = {} }: RemoveMarkFromSelectionCommandArgs
  ): void {
    const selection = transaction.workingCopy.selection;
    if (selection.isCollapsed) {
      transaction.removeMarkFromSelection(markName);
      // TODO
      // this.model.rootNode.focus();
      // this.model.emitSelectionChanged();
    } else {
      const spec = transaction.workingCopy.marksRegistry.lookupMark(markName);
      if (!ModelSelection.isWellBehaved(selection)) {
        throw new MisbehavedSelectionError();
      }
      if (spec) {
        const resultRange = transaction.removeMark(
          selection.lastRange,
          spec,
          markAttributes
        );
        transaction.selectRange(resultRange);
      } else {
        throw new ModelError(`Unrecognized mark: ${markName}`);
      }
    }
    transaction.workingCopy.eventBus.emit(
      new SelectionChangedEvent({
        owner: CORE_OWNER,
        payload: transaction.workingCopy.selection,
      })
    );
  }
}
