import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Model from '@lblod/ember-rdfa-editor/model/model';

export default class AddTypeCommand extends Command {
  name = 'add-type';

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(type: string, element: ModelElement) {
    let oldTypeof = element.getAttribute('typeof');
    if (!oldTypeof) oldTypeof = '';
    const newType = `${oldTypeof} ${type}`;
    this.model.change((mutator) => {
      const newNode = mutator.setProperty(element, 'typeof', newType);
      this.model.selectRange(ModelRange.fromInElement(newNode, 0, 0));
    });
  }
}
