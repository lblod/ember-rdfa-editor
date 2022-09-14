import { Mark } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelText from '../core/model/nodes/model-text';
declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeMarkFromNode: RemoveMarkFromNodeCommand;
  }
}
export interface RemoveMarkFromNodeCommandArgs {
  mark: Mark;
  node: ModelText;
}

export default class RemoveMarkFromNodeCommand
  implements Command<RemoveMarkFromNodeCommandArgs, boolean>
{
  canExecute(): boolean {
    return true;
  }
  execute(
    { transaction }: CommandContext,
    { mark, node }: RemoveMarkFromNodeCommandArgs
  ): boolean {
    if (node) {
      if (!node.hasMark(mark)) {
        return false;
      }
      transaction.removeMark(
        ModelRange.fromAroundNode(node),
        mark.spec,
        mark.attributes
      );
      return true;
    }
    return false;
  }
}
