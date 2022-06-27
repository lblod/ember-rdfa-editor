import { ModelInlineComponent } from '../model/inline-components/model-inline-component';
import Model from '../model/model';
import { logExecute } from '../utils/logging-utils';
import Command from './command';

export default class RemoveComponentCommand extends Command {
  name = 'remove-component';

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(component: ModelInlineComponent): void {
    this.model.change(() => {
      component.remove();
    });
  }
}
