import {
  ModelInlineComponent,
  Properties,
} from '../model/inline-components/model-inline-component';
import Model from '../model/model';
import ModelElement from '../model/model-element';
import ModelRange from '../model/model-range';
import { ModelError } from '../utils/errors';
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
    createSnapshot = true,
    range: ModelRange | null = this.model.selection.lastRange
  ): void {
    if (!range) {
      return;
    }
    const componentSpec =
      this.model.inlineComponentsRegistry.lookUpComponent(componentName);
    if (componentSpec) {
      const component = new ModelInlineComponent(componentSpec, props);
      this.model.change(
        (mutator) => {
          const resultingRange = mutator.insertNodes(range, component);
          resultingRange.collapse();
          if (!component.nextSibling) {
            const brAfterComponent = new ModelElement('br');
            brAfterComponent.setAttribute('class', 'trailing');
            mutator.insertNodes(resultingRange, brAfterComponent);
          }
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
