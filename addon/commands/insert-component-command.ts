import {
  ModelInlineComponent,
  Properties,
  State,
} from '../core/model/inline-components/model-inline-component';
import ModelElement from '../core/model/nodes/model-element';
import ModelRange from '../core/model/model-range';
import { ModelError } from '../utils/errors';
import { logExecute } from '../utils/logging-utils';
import Command, { CommandContext } from './command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    insertComponent: InsertComponentCommand;
  }
}
export interface InsertComponentCommandArgs {
  componentName: string;
  props?: Properties;
  componentState?: State;
  createSnapshot?: boolean;
  range: ModelRange | null;
}

export default class InsertComponentCommand
  implements Command<InsertComponentCommandArgs, void>
{
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
      range = transaction.workingCopy.selection.lastRange,
    }: InsertComponentCommandArgs
  ): void {
    if (!range) {
      return;
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
      const newRange = transaction.insertNodes(range, component);
      newRange.collapse();
      if (!component.nextSibling) {
        const brAfterComponent = new ModelElement('br');
        brAfterComponent.setAttribute('class', 'trailing');
        transaction.insertNodes(newRange, brAfterComponent);
      }

      transaction.selectRange(newRange);
      if (createSnapshot) {
        transaction.createSnapshot();
      }
    } else {
      throw new ModelError(`Unrecognized component: ${componentName}`);
    }
  }
}
