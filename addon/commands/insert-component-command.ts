import {
  ModelInlineComponent,
  Properties,
  State,
} from '../model/inline-components/model-inline-component';
import ModelElement from '../model/model-element';
import ModelSelection from '../model/model-selection';
import { MisbehavedSelectionError, ModelError } from '../utils/errors';
import { logExecute } from '../utils/logging-utils';
import Command, { CommandContext } from './command';

export interface InsertComponentCommandArgs {
  componentName: string;
  props?: Properties;
  componentState?: State;
  createSnapshot?: boolean;
}

export default class InsertComponentCommand
  implements Command<InsertComponentCommandArgs, void>
{
  name = 'insert-component';
  arguments = ['componentName', 'props', 'componentState', 'createSnapshot'];

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    {
      componentName,
      props = {},
      componentState = {},
      createSnapshot = true,
    }: InsertComponentCommandArgs
  ): void {
    const selection = transaction.workingCopy.selection;
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const componentSpec =
      transaction.workingCopy.inlineComponentsRegistry.lookUpComponent(
        componentName
      );
    if (componentSpec) {
      const component = new ModelInlineComponent(
        componentSpec,
        props,
        componentState
      );
      const newRange = transaction.insertNodes(selection.lastRange, component);
      newRange.collapse();
      const brAfterComponent = new ModelElement('br');
      brAfterComponent.setAttribute('class', 'trailing');
      transaction.insertNodes(newRange, brAfterComponent);
      transaction.selectRange(newRange);
      if (createSnapshot) {
        transaction.createSnapshot();
      }
    } else {
      throw new ModelError(`Unrecognized component: ${componentName}`);
    }
  }
}
