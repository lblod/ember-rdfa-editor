import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

export default class RemoveTypeCommand extends Command {
  name = 'remove-type';
  @logExecute
  execute(type: string, element: ModelElement) {
    const oldTypeof = element.getAttribute('typeof');
    let typesArray = oldTypeof?.split(' ');
    if (!typesArray) typesArray = [];
    let newType = '';
    for (const typeString of typesArray) {
      if (type === typeString) continue;
      newType += typeString + ' ';
    }
    let newNode;
    this.model.change((mutator) => {
      newNode = mutator.setProperty(element, 'typeof', newType);
      this.model.selectRange(ModelRange.fromAroundNode(newNode));
    });
    return newNode;
  }
}
