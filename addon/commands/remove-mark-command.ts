import { Mark } from '@lblod/ember-rdfa-editor/model/mark';
import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
export interface RemoveMarkCommandArgs {
  mark: Mark;
}

export default class RemoveMarkCommand
  implements Command<RemoveMarkCommandArgs, boolean>
{
  name = 'remove-mark';
  arguments: string[] = ['mark'];

  canExecute(): boolean {
    return true;
  }
  execute(
    { transaction }: CommandContext,
    { mark }: RemoveMarkCommandArgs
  ): boolean {
    const node = mark.node;
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
