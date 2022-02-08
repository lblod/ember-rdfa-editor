import SetPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelSelection from '../../model/model-selection';

export default class RemoveUnderlineCommand extends SetPropertyCommand {
  name = 'remove-type';
  @logExecute
  execute(type: string, element: ModelElement) {
    const oldTypeof = node.getAttribute('typeof');
    const typesArray = oldTypeof?.split(' ');
    let newType = '';
    for (const typeString of typesArray) {
      if (type === typeString) continue;
      newType += typeString + ' ';
    }
    this.model.change((mutator) => {
      const resultRange = mutator.setProperty(element, 'typeof', newType);
      this.model.selectRange(resultRange);
    });
  }
}
