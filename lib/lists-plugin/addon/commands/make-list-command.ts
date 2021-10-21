import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import {MisbehavedSelectionError, ModelError} from "@lblod/ember-rdfa-editor/util/errors";
import ArrayUtils from "@lblod/ember-rdfa-editor/util/array-utils";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/util/model-tree-walker";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ListCleaner from "@lblod/ember-rdfa-editor/core/cleaners/list-cleaner";
import {PropertyState} from "@lblod/ember-rdfa-editor/util/types";

type ListTag = "ul" | "ol";

/**
 * Command will convert all nodes in the selection to a list, if they are not already in a list.
 */
export default class MakeListCommand extends Command<[ListTag, ModelSelection], void> {
  name = "make-list";

  constructor(model: EditorModel) {
    super(model);
  }

  canExecute(_listType: ListTag, selection: ModelSelection = this.model.selection) {
    return !selection.inTableState || (selection.inTableState === PropertyState.disabled);
  }

  execute(executedBy: string, listType: ListTag, selection: ModelSelection = this.model.selection) {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const range = selection.lastRange;
    const wasCollapsed = range.collapsed;
    const blocks = this.getBlocksFromRange(range);

    const list = new ModelElement(listType);
    for (const block of blocks) {
      const li = new ModelElement("li");
      // TODO: Investigate why we have to clone here and document it.
      li.appendChildren(...block.map(node => node.clone()));
      list.addChild(li);
    }

    this.model.change(executedBy, mutator => {
      mutator.insertNodes(range, list);
      if (!list.firstChild || !list.lastChild) {
        throw new ModelError("List without list item.");
      }

      const fullRange = ModelRange.fromInElement(
        this.model.modelRoot,
        0,
        this.model.modelRoot.getMaxOffset()
      );
      const cleaner = new ListCleaner();
      cleaner.clean(fullRange, mutator);

      let resultRange;
      if (wasCollapsed) {
        const firstChild = list.firstChild as ModelElement;
        resultRange = ModelRange.fromInElement(firstChild, 0, firstChild.getMaxOffset());
      } else {
        const firstChild = list.firstChild as ModelElement;
        const lastChild = list.lastChild as ModelElement;
        const start = ModelPosition.fromInElement(firstChild, 0);
        const end = ModelPosition.fromInElement(lastChild, lastChild.getMaxOffset());
        resultRange = new ModelRange(start, end);
      }

      this.model.selection.selectRange(resultRange);
    });
  }

  private getBlocksFromRange(range: ModelRange): ModelNode[][] {
    // Expand range until it is bound by blocks.
    let current: ModelNode | null = range.start.nodeAfter();
    if (current) {
      range.start.parentOffset = current.getOffset();

      while (current?.previousSibling && !current.previousSibling.isBlock) {
        current = current.previousSibling;
        range.start.parentOffset = current.getOffset();
      }

      if (range.start.parentOffset === 0) {
        if (range.start.parent === this.model.modelRoot) {
          // Expanded to the start of the root node.
          range.start = ModelPosition.fromInElement(this.model.modelRoot, 0);
        } else {
          range.start = ModelPosition.fromInElement(range.start.parent.parent!, range.start.parent.getOffset());
        }
      }
    }

    current = range.end.nodeBefore();

    if (current) {
      range.end.parentOffset = current.getOffset() + current.offsetSize;
      while (current?.nextSibling && !current.nextSibling.isBlock) {
        current = current.nextSibling;
        range.end.parentOffset = current.getOffset() + current.offsetSize;
      }

      if (range.end.parentOffset === range.end.parent.getMaxOffset()) {
        if (range.end.parent === this.model.modelRoot) {
          // Expanded to the end of root node.
          range.end = ModelPosition.fromInElement(this.model.modelRoot, this.model.modelRoot.getMaxOffset());
        } else {
          range.end = ModelPosition.fromInElement(range.end.parent.parent!, range.end.parent.getOffset() + range.end.parent.offsetSize);
        }
      }
    }

    const confinedRanges = range.getMinimumConfinedRanges();
    const result = [[]];
    let pos = 0;

    for (const range of confinedRanges) {
      const walker = new ModelTreeWalker({range, descend: false});
      for (const node of walker) {
        if (ModelNode.isModelElement(node) && node.type === "br") {
          pos++;
        } else if (node.isBlock) {
          if (result[0].length) {
            pos++;
          }
          ArrayUtils.pushOrCreate(result, pos, node);
          pos++;
        } else if (node.hasVisibleText()) {
          ArrayUtils.pushOrCreate(result, pos, node);
        }
      }
    }

    return result;
  }
}
