import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import { Mark } from '@lblod/ember-rdfa-editor/model/mark';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import {
  MisbehavedSelectionError,
  ModelError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { AttributeSpec, Serializable } from '../model/util/render-spec';
import { CORE_OWNER } from '../model/util/constants';
import { SelectionChangedEvent } from '../utils/editor-event';

export interface AddMarkToSelectionCommandArgs {
  markName: string;
  markAttributes?: Record<string, Serializable>;
}
export default class AddMarkToSelectionCommand
  implements Command<AddMarkToSelectionCommandArgs, void>
{
  arguments = ['markName', 'markAttributes'];
  name = 'add-mark-to-selection';

  canExecute(): boolean {
    return true;
  }

  execute(
    { state, dispatch }: CommandContext,
    { markName, markAttributes = {} }: AddMarkToSelectionCommandArgs
  ): void {
    const selection = state.selection;
    const spec = state.marksRegistry.lookupMark(markName);
    const tr = state.createTransaction();
    if (spec) {
      if (selection.isCollapsed) {
        tr.addMarkToSelection(new Mark<AttributeSpec>(spec, markAttributes));

        // TODO
        // this.model.rootNode.focus();
        // this.model.emitSelectionChanged();
      } else {
        if (!ModelSelection.isWellBehaved(selection)) {
          throw new MisbehavedSelectionError();
        }
        const resultRange = tr.addMark(
          selection.lastRange,
          spec,
          markAttributes
        );
        tr.selectRange(resultRange);
      }
      const newState = dispatch(tr);
      state.eventBus.emit(
        new SelectionChangedEvent({
          owner: CORE_OWNER,
          payload: newState.selection,
        })
      );
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
