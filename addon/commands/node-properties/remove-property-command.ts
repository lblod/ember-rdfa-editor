import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { modelPosToSimplePos } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeProperty: RemovePropertyCommand;
  }
}

export interface RemovePropertyCommandArgs {
  node: ModelNode;
  property: string;
}

export default class RemovePropertyCommand
  implements Command<RemovePropertyCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { node, property }: RemovePropertyCommandArgs
  ) {
    const nodeInLatestState = transaction.inWorkingCopy(node);
    transaction.removeProperty(
      modelPosToSimplePos(
        ModelPosition.fromBeforeNode(
          transaction.apply().document,
          nodeInLatestState
        )
      ),
      property
    );
  }
}
