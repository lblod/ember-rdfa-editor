import Command from './command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import {
  IllegalExecutionStateError,
  MisbehavedSelectionError,
  TypeAssertionError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import ImmediateModelMutator from '@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';

export default class InsertNewLiCommand extends Command {
  name = 'insert-newLi';

  constructor(model: Model) {
    super(model);
  }

  canExecute(
    range: ModelRange | null = this.model.selection.lastRange
  ): boolean {
    if (!range) {
      return false;
    }

    return range.hasCommonAncestorWhere(ModelNodeUtils.isListContainer);
  }

  @logExecute
  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const startParentLi = range.start.findAncestors(
      ModelNodeUtils.isListElement
    )[0];
    const endParentLi = range.end.findAncestors(
      ModelNodeUtils.isListElement
    )[0];

    if (!startParentLi || !endParentLi) {
      throw new IllegalExecutionStateError("Couldn't locate parent lis");
    }

    this.model.change((mutator) => {
      // Collapsed selection case
      if (range.collapsed) {
        this.insertLi(mutator, range.start);
      }
      // Single li expanded selection case
      else if (startParentLi === endParentLi) {
        mutator.insertNodes(range);
        this.insertLi(mutator, range.start);
      }
      // Multiple lis selected case
      else {
        const newRange = mutator.insertNodes(range);
        this.model.selectRange(newRange);
      }
    });
  }

  private insertLi(mutator: ImmediateModelMutator, position: ModelPosition) {
    let newPosition = mutator.splitUntil(
      position,
      (node) => ModelNodeUtils.isListContainer(node.parent),
      false
    );
    newPosition = mutator.splitUntil(
      newPosition,
      ModelNodeUtils.isListContainer,
      true
    );

    const nodeBefore = newPosition.nodeBefore();
    const nodeAfter = newPosition.nodeAfter();

    if (
      !nodeBefore ||
      !nodeAfter ||
      !ModelNodeUtils.isListElement(nodeBefore) ||
      !ModelNodeUtils.isListElement(nodeAfter)
    ) {
      throw new TypeAssertionError('Node right after the cursor is not an li');
    }
    if (nodeBefore.length === 0) {
      mutator.insertNodes(
        ModelRange.fromInElement(nodeBefore),
        new ModelText(INVISIBLE_SPACE)
      );
    }
    if (nodeAfter.length === 0) {
      mutator.insertNodes(
        ModelRange.fromInElement(nodeAfter),
        new ModelText(INVISIBLE_SPACE)
      );
      this.model.selectRange(ModelRange.fromInElement(nodeAfter, 1, 1));
    } else {
      this.model.selectRange(ModelRange.fromInElement(nodeAfter, 0, 0));
    }
  }
}
