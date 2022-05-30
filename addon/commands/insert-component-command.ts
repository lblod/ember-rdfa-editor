import {
  ModelInlineComponent,
  Properties,
} from '../model/inline-components/model-inline-component';
import Model from '../model/model';
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
    selection: ModelSelection = this.model.selection
  ): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const componentSpec =
      this.model.inlineComponentsRegistry.lookUpComponent(componentName);
    if (componentSpec) {
      const component = new ModelInlineComponent(componentSpec, props);
      this.model.change((mutator) => {
        mutator.insertNodes(selection.lastRange, component);
      });
      const node = this.model.modelToView(component)?.viewRoot;
      if (node) {
        this.model.addComponentInstance(node, componentName);
      }
    } else {
      throw new ModelError(`Unrecognized component: ${componentName}`);
    }
  }
}
