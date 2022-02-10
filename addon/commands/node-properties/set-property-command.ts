import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';

export default class SetPropertyCommand extends Command {
  name = 'set-property';

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(property: string, value: string, element: ModelElement) {
    this.model.change((mutator) => {
      mutator.setProperty(element, property, value);
    });
  }
}
