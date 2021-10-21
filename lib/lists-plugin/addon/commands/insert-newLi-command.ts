import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import {
  IllegalExecutionStateError,
  MisbehavedSelectionError,
  TypeAssertionError
} from "@lblod/ember-rdfa-editor/util/errors";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/util/model-node-utils";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import {Mutator} from "@lblod/ember-rdfa-editor/core/mutator";

export default class InsertNewLiCommand extends Command<[ModelRange], void> {
  name = "insert-newLi";

  constructor(model: EditorModel) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    return range.hasCommonAncestorWhere(ModelNodeUtils.isListContainer);
  }

  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const startParentLi = range.start.findAncestors(ModelNodeUtils.isListElement)[0];
    const endParentLi = range.end.findAncestors(ModelNodeUtils.isListElement)[0];

    if (!startParentLi || !endParentLi) {
      throw new IllegalExecutionStateError("Couldn't locate parent lis");
    }

    this.model.change(executedBy, mutator => {
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
        this.model.selection.selectRange(newRange);
      }
    });
  }

  private insertLi(mutator: Mutator, position: ModelPosition) {
    const newPosition = mutator.splitUntil(position, ModelNodeUtils.isListContainer, true);
    const liNode = newPosition.nodeAfter();

    if (!liNode || !ModelNodeUtils.isListElement(liNode)) {
      throw new TypeAssertionError("Node right after the cursor is not an li");
    }

    this.model.selection.selectRange(ModelRange.fromInElement(liNode, 0, 0));
  }
}
