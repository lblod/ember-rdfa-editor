import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError, ModelError} from "@lblod/ember-rdfa-editor/utils/errors";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";
import ListCleaner from "@lblod/ember-rdfa-editor/model/cleaners/list-cleaner";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {PropertyState} from "../model/util/types";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";


/**
 * command will convert all nodes in the selection to a list if they are not already in a list
 */
export default class MakeListCommand extends Command {
  name = "make-list";

  constructor(model: Model) {
    super(model);
  }

  canExecute(selection: ModelSelection = this.model.selection) {
    return !selection.inTableState || (selection.inTableState === PropertyState.disabled);
  }


  @logExecute
  execute(listType: "ul" | "ol", selection: ModelSelection = this.model.selection) {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const range = selection.lastRange;
    const wasCollapsed = range.collapsed;
    const blocks = this.getBlocksFromRange(range);
    const list = new ModelElement(listType);
    for (const block of blocks) {
      const li = new ModelElement("li");
      //TODO investigate why we have to clone here and document it
      li.appendChildren(...block.map(node => node.clone()));
      list.addChild(li);
    }


    this.model.change(mutator => {
      mutator.insertNodes(range, list);
      if (!list.firstChild || !list.lastChild) {
        throw new ModelError("list without listitem");
      }
      const fullRange = ModelRange.fromInElement(this.model.rootModelNode, 0, this.model.rootModelNode.getMaxOffset());
      const cleaner = new ListCleaner();
      cleaner.clean(fullRange);
      let resultRange;
      if (wasCollapsed) {
        const firstChild = list.firstChild as ModelElement;
        resultRange = ModelRange.fromInElement(firstChild, 0, firstChild.getMaxOffset());
      } else {
        const firstChild = list.firstChild as ModelElement;
        const lastChild = list.lastChild as ModelElement;
        const start = ModelPosition.fromInElement(firstChild , 0);
        const end = ModelPosition.fromInElement(lastChild, lastChild.getMaxOffset());
        resultRange = new ModelRange(start, end);
      }
      this.model.selection.selectRange(resultRange);
    });
  }

  private getBlocksFromRange(range: ModelRange): ModelNode[][] {
    // expand range until it is bound by blocks

    let cur: ModelNode | null = range.start.nodeAfter();
    if (cur) {

      range.start.parentOffset = cur?.getOffset();

      while (cur?.previousSibling && !cur.previousSibling.isBlock) {
        cur = cur.previousSibling;
        range.start.parentOffset = cur.getOffset();
      }
      if (range.start.parentOffset === 0) {
        if (range.start.parent === this.model.rootModelNode) {
          //expanded to the start of the root node
          range.start = ModelPosition.fromInElement(this.model.rootModelNode, 0);
        } else {
          range.start = ModelPosition.fromInElement(range.start.parent.parent!, range.start.parent.getOffset());
        }
      }
    }
    cur = range.end.nodeBefore();

    if (cur) {

      range.end.parentOffset = cur.getOffset() + cur.offsetSize;
      while (cur?.nextSibling && !cur.nextSibling.isBlock) {
        cur = cur.nextSibling;
        range.end.parentOffset = cur.getOffset() + cur.offsetSize;
      }
      if (range.end.parentOffset === range.end.parent.getMaxOffset()) {
        if (range.end.parent === this.model.rootModelNode) {
          // expanded to the end of root
          range.end = ModelPosition.fromInElement(this.model.rootModelNode, this.model.rootModelNode.getMaxOffset());
        } else {
          range.end = ModelPosition.fromInElement(range.end.parent.parent!, range.end.parent.getOffset() + range.end.parent.offsetSize);
        }
      }
    }


    const confinedRanges = range.getMinimumConfinedRanges();
    const rslt = [[]];
    let pos = 0;
    for (const range of confinedRanges) {
      const walker = new ModelTreeWalker({range, descend: false});
      for (const node of walker) {
        if (ModelNode.isModelElement(node) && node.type === "br") {
          pos++;
        } else if (node.isBlock) {
          if (rslt[0].length) {
            pos++;
          }
          ArrayUtils.pushOrCreate(rslt, pos, node);
          pos++;
        } else if (node.hasVisibleText()) {
          ArrayUtils.pushOrCreate(rslt, pos, node);
        }

      }


    }

    return rslt;

  }
}

