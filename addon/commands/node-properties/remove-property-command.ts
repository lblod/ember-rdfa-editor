import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';

export default class RemovePropertyCommand extends Command {
  name = 'remove-property';

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(element: ModelElement, property: string) {
    this.model.change((mutator) => {
      mutator.removeProperty(element, property);
    });
  }
}
