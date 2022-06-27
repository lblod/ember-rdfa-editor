import {
  ModelInlineComponent,
  Properties,
  State,
} from '../model/inline-components/model-inline-component';
import Model from '../model/model';
import ModelElement from '../model/model-element';
import ModelSelection from '../model/model-selection';
import { MisbehavedSelectionError, ModelError } from '../utils/errors';
import { logExecute } from '../utils/logging-utils';
import Command from './command';

export default class InsertComponentCommand extends Command {
  name = 'insert-component';

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    componentName: string,
    props: Properties = {},
    state: State = {},
    createSnapshot = true,
    selection: ModelSelection = this.model.selection
  ): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const componentSpec =
      this.model.inlineComponentsRegistry.lookUpComponent(componentName);
    if (componentSpec) {
      const component = new ModelInlineComponent(componentSpec, props, state);
      this.model.change(
        (mutator) => {
          const resultingRange = mutator.insertNodes(
            selection.lastRange,
            component
          );
          resultingRange.collapse();
          const brAfterComponent = new ModelElement('br');
          brAfterComponent.setAttribute('class', 'trailing');
          mutator.insertNodes(resultingRange, brAfterComponent);
          this.model.selectRange(resultingRange);
        },
        true,
        createSnapshot
      );
    } else {
      throw new ModelError(`Unrecognized component: ${componentName}`);
    }
  }
}
