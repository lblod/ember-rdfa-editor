import State from '@lblod/ember-rdfa-editor/core/state';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { compatTextAttributeMap } from '@lblod/ember-rdfa-editor/utils/constants';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import Command, { CommandContext } from '../command';

export type TextAttribute =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'highlighted';

/**
 * @deprecated
 */
export default abstract class SetTextPropertyCommand<A>
  implements Command<A, void>
{
  abstract canExecute(state: State, args: A): boolean;
  abstract execute(context: CommandContext, args: A): void;

  protected setTextProperty(
    tr: Transaction,
    property: TextAttribute,
    value: boolean,
    selection: ModelSelection
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
      if (value) {
        tr.addMark(range, specAttribute.spec, specAttribute.attributes);
      } else {
        tr.removeMark(range, specAttribute.spec, specAttribute.attributes);
      }
    } else {
      throw new ModelError(`No mark found for property: ${property}`);
    }
  }
}
