import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import { Mark } from '@lblod/ember-rdfa-editor/model/marks/mark';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import {
  MisbehavedSelectionError,
  ModelError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { AttributeSpec, Serializable } from '../utils/render-spec';
import { CORE_OWNER } from '../utils/constants';
import { SelectionChangedEvent } from '../utils/editor-event';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    addMarkToSelection: AddMarkToSelectionCommand;
  }
}

export interface AddMarkToSelectionCommandArgs {
  markName: string;
  markAttributes?: Record<string, Serializable>;
}

export default class AddMarkToSelectionCommand
  implements Command<AddMarkToSelectionCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  execute(
    { transaction }: CommandContext,
    { markName, markAttributes = {} }: AddMarkToSelectionCommandArgs
  ): void {
    const selection = transaction.workingCopy.selection;
    const spec = transaction.workingCopy.marksRegistry.lookupMark(markName);
    if (spec) {
      if (selection.isCollapsed) {
        transaction.addMarkToSelection(
          new Mark<AttributeSpec>(spec, markAttributes)
        );

        // TODO
        // this.model.rootNode.focus();
        // this.model.emitSelectionChanged();
      } else {
        if (!ModelSelection.isWellBehaved(selection)) {
          throw new MisbehavedSelectionError();
        }
        const resultRange = transaction.addMark(
          selection.lastRange,
          spec,
          markAttributes
        );
        transaction.selectRange(resultRange);
      }
      transaction.workingCopy.eventBus.emit(
        new SelectionChangedEvent({
          owner: CORE_OWNER,
          payload: transaction.workingCopy.selection,
        })
      );
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
