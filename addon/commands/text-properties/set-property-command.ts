import Command from '../command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { compatTextAttributeMap } from '@lblod/ember-rdfa-editor/model/util/constants';

export type TextAttribute =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'highlighted';

/**
 * @deprecated
 */
export default abstract class SetPropertyCommand extends Command {
  constructor(model: Model) {
    super(model);
  }

  protected setProperty(
    property: TextAttribute,
    value: boolean,
    selection: ModelSelection = this.model.selection
  ) {
    if (!ModelSelection.isWellBehaved(selection)) {
      console.info(
        'Not executing SetPropertyCommand because selection is missing'
      );
      return;
    }

    const range = selection.lastRange;
    const specAttribute = compatTextAttributeMap.get(property);
    if (specAttribute) {
      this.model.change((mutator) => {
        let resultRange;
        if (value) {
          resultRange = mutator.addMark(
            range,
            specAttribute.spec,
            specAttribute.attributes,
            this.model.marksRegistry
          );
        } else {
          resultRange = mutator.removeMark(
            range,
            specAttribute.spec,
            this.model.marksRegistry
          );
        }
        this.model.selectRange(resultRange);
      });
    } else {
      throw new ModelError(`No mark found for property: ${property}`);
    }
  }
}
