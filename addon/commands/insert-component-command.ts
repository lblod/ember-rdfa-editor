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
    { state, dispatch }: CommandContext,
    {
      componentName,
      props = {},
      componentState = {},
      createSnapshot = true,
    }: InsertComponentCommandArgs
  ): void {
    const selection = state.selection;
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const componentSpec =
      state.inlineComponentsRegistry.lookUpComponent(componentName);
    if (componentSpec) {
      const component = new ModelInlineComponent(
        componentSpec,
        props,
        componentState
      );
      const tr = state.createTransaction();
      const newRange = tr.insertNodes(selection.lastRange, component);
      newRange.collapse();
      const brAfterComponent = new ModelElement('br');
      brAfterComponent.setAttribute('class', 'trailing');
      tr.insertNodes(newRange, brAfterComponent);
      tr.selectRange(newRange);
      if (createSnapshot) {
        tr.createSnapshot();
      }
      dispatch(tr);
    } else {
      throw new ModelError(`Unrecognized component: ${componentName}`);
    }
  }
}
