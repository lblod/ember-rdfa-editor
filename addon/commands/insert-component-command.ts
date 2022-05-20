import { ModelInlineComponent } from '../model/inline-components/model-inline-component';
import Model from '../model/model';
import ModelNode from '../model/model-node';
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
    child: ModelNode | null = null,
    attributes: Map<string, string> = new Map(),
    selection: ModelSelection = this.model.selection
  ): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const componentSpec =
      this.model.inlineComponentsRegistry.lookUpComponent(componentName);
    if (componentSpec) {
      const component = new ModelInlineComponent(componentSpec, attributes);
      if (child) {
        component.addChild(child);
      }
      this.model.change((mutator) => {
        mutator.insertNodes(selection.lastRange, component);
      });
    } else {
      throw new ModelError(`Unrecognized component: ${componentName}`);
    }
  }
}
