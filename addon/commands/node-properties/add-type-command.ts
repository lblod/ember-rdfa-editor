import SetPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelSelection from '../../model/model-selection';

export default class RemoveUnderlineCommand extends SetPropertyCommand {
  name = 'add-type';
  @logExecute
  execute(type: string, element: ModelElement) {
    const oldTypeof = node.getAttribute('typeof');
    const newType = oldTypeof + type;
    this.model.change((mutator) => {
      const resultRange = mutator.setProperty(element, 'typeof', newType);
      this.model.selectRange(resultRange);
    });
  }
}
