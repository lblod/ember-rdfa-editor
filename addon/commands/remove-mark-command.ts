import { Mark } from '@lblod/ember-rdfa-editor/model/mark';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

export default class RemoveMarkCommand extends Command<[Mark], boolean> {
  name = 'remove-mark';

  constructor(model: Model) {
    super(model);
  }

  execute(mark: Mark): boolean {
    const node = mark.node;
    if (!node.hasMark(mark)) {
      return false;
    }
    this.model.change((mutator) => {
      mutator.removeMark(
        ModelRange.fromAroundNode(node),
        mark.spec,
        mark.attributes
      );
    });
    return true;
  }
}
