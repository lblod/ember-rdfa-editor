import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import Model from '@lblod/ember-rdfa-editor/model/model';

export default class RemoveTypeCommand extends Command {
  name = 'remove-type';

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(type: string, element: ModelElement) {
    const oldTypeof = element.getAttribute('typeof');
    const typesArray = oldTypeof ? oldTypeof.split(' ') : [];
    const newTypeof = typesArray.filter((t) => t !== type).join(' ');
    let newNode;
    this.model.change((mutator) => {
      newNode = mutator.setProperty(element, 'typeof', newTypeof);
      this.model.selectRange(ModelRange.fromInElement(newNode, 0, 0));
    });
    return newNode;
  }
}
