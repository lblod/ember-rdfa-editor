import { Mark } from '@lblod/ember-rdfa-editor/model/mark';
import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
export interface RemoveMarkCommandArgs {
  mark: Mark;
}

export default class RemoveMarkCommand
  implements Command<RemoveMarkCommandArgs, boolean>
{
  name = 'remove-mark';

  canExecute(): boolean {
    return true;
  }
  execute(
    { state, dispatch }: CommandContext,
    { mark }: RemoveMarkCommandArgs
  ): boolean {
    const node = mark.node;
    if (node) {
      if (!node.hasMark(mark)) {
        return false;
      }
      const tr = state.createTransaction();
      tr.removeMark(
        ModelRange.fromAroundNode(node),
        mark.spec,
        mark.attributes
      );
      dispatch(tr);
      return true;
    }
    return false;
  }
}
