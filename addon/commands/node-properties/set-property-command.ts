import SetPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelSelection from '../../model/model-selection';

export default class RemoveUnderlineCommand extends SetPropertyCommand {
  name = 'set-property';
  @logExecute
  execute(property: string, value: string, element: ModelElement) {

    this.model.change((mutator) => {
      const resultRange = mutator.setProperty(element, property, value);
      this.model.selectRange(resultRange);
    });
  }
}
