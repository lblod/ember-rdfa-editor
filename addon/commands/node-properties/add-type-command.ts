import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { modelPosToSimplePos } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';

export interface AddTypeCommandArgs {
  type: string;
  element: ModelElement;
}

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    addType: AddTypeCommand;
  }
}
export default class AddTypeCommand
  implements Command<AddTypeCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { type, element }: AddTypeCommandArgs
  ) {
    let oldTypeof = element.getAttribute('typeof');
    if (!oldTypeof) oldTypeof = '';
    const newType = `${oldTypeof} ${type}`;
    const elementInLatestState = transaction.inWorkingCopy(element);
    transaction.setProperty(
      modelPosToSimplePos(
        ModelPosition.fromBeforeNode(
          transaction.apply().document,
          elementInLatestState
        )
      ),
      'typeof',
      newType
    );
  }
}
