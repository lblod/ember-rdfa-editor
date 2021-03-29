import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {listTypes} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelTreeWalker, {FilterResult} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

export default class RemoveListCommand extends Command {
  name = "remove-list";

  constructor(model: Model) {
    super(model);
  }

  execute(selection: ModelSelection = this.model.selection) {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const range = selection.lastRange;
    let listNodesIterator;
    if (range.collapsed) {

      listNodesIterator = selection.findAllInSelectionOrAncestors({
        filter: ModelNode.isModelElement,
        predicate: (node: ModelElement) => {
          return node.type === "li";
        }
      });

      if (!listNodesIterator) {
        throw new SelectionError('The selection is not in a list');
      }
    } else {
      const maximizedRange = range.getMaximizedRange();

      listNodesIterator = new ModelTreeWalker({
        range: maximizedRange,
        filter: (node) => ModelNode.isModelElement(node) && node.type === "li" ? FilterResult.FILTER_ACCEPT : FilterResult.FILTER_SKIP
      });

    }
    const listNodes = Array.from(listNodesIterator) as ModelElement[];
    const commonAncestor = range.getCommonAncestor();
    if (ModelNode.isModelElement(commonAncestor) && commonAncestor.type === "li") {
      listNodes.push(commonAncestor);
    }


    for (const li of listNodes) {
      this.bubbleUpLi(li);
      if (!li.previousSibling?.isBlock && li.previousSibling?.hasVisibleText()) {
        li.addChild(new ModelElement("br"), 0);
      }
      if (!li.nextSibling?.isBlock && li.nextSibling?.hasVisibleText()) {
        li.addChild(new ModelElement("br"));
      }
      li.unwrap();
    }
    const start = ModelPosition.fromBeforeNode(listNodes[0]);
    const endLi = listNodes[listNodes.length - 1];
    const end = ModelPosition.fromAfterNode(endLi);
    const resultingRange = new ModelRange(start, end);
    selection.selectRange(resultingRange);

    this.model.write();

  }

  private bubbleUpLi(li: ModelElement) {

    if (li.parent) {
      while (li.findAncestor(node => ModelNode.isModelElement(node) && listTypes.has(node.type), false)) {
        li.isolate();
        if (li.parent.previousSibling && !li.parent.previousSibling.hasVisibleText()) {
          this.model.removeModelNode(li.parent.previousSibling);
        }
        li.promote(true);

        const nextSibling = li.nextSibling;
        const previousSibling = li.previousSibling;

        // TODO: eventually we should rely on list elements only having [li]'s as children and enforce that somewhere else
        if (nextSibling && ModelNode.isModelElement(nextSibling)) {
          if (!nextSibling.hasVisibleText()) {
            this.model.removeModelNode(nextSibling);
          }
        }
        if (previousSibling && ModelNode.isModelElement(previousSibling)) {
          if (!previousSibling.hasVisibleText()) {
            this.model.removeModelNode(previousSibling);
          }
        }
      }
    }
  }

}
