import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelElement, {ElementType} from "../model/model-element";
import {MisbehavedSelectionError, NoParentError, NoTopSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";


/**
 * command will convert all nodes in the selection to a list if they are not already in a list
 */
export default class MakeUnorderedListCommand extends Command {
  name = "make-unordered-list";

  constructor(model: Model) {
    super(model);
  }

  getTopBlockNode(node: ModelNode): ModelNode | null {
    if (node.isBlock) return node;
    const parent = node.parent;
    if (!parent) return node;
    if (ModelElement.isModelElement(parent)) {
      const element = parent as ModelElement;
      for (const child of element.children) {
        if (child.boundNode?.nodeName === 'BR') {
          return node;
        }
      }
      return this.getTopBlockNode(parent);
    } else {
      return this.getTopBlockNode(parent);
    }
  }

  execute(selection: ModelSelection = this.model.selection) {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const interestingPositions = selection.lastRange.getSelectedTopPositions();

    if (!interestingPositions) {
      throw new NoTopSelectionError();
    }
    const interestingNodes = interestingPositions.map(pos => pos.parent);
    const whereToInsert = interestingPositions[0].parent.parent;

    if (!whereToInsert) {
      throw new NoParentError();
    }
    const positionToInsert = interestingPositions[0].parent.index;

    const items: ModelNode[][] = [];
    let index = 0;
    let hasBlocks = false;
    for (const node of interestingNodes) {
      if (ModelNode.isModelElement(node)) {
        if (node.type === "br") {
          index++;
          hasBlocks = true;
        } else if (node.isBlock) {
          index++;
          items.push([node]);
          index++;
          hasBlocks = true;
        } else {
          ArrayUtils.pushOrCreate(items, index, node);
        }
      } else if (ModelNode.isModelText(node)) {
        ArrayUtils.pushOrCreate(items, index, node);
      }
    }
    if (items.length && hasBlocks) {
      for (const node of interestingNodes) {
        this.model.removeModelNode(node);
      }
      const list = this.buildList("ul", items);

      whereToInsert.addChild(list, positionToInsert!);
      selection.selectNode(whereToInsert);
      this.model.write(whereToInsert!);
    } else {
      const block = this.getTopBlockNode(selection.getCommonAncestor()?.parent!) as ModelElement;
      const parent = block.parent;
      if (!parent) {
        throw new NoParentError();
      }
      const positionToInsert = block.index;
      const li = new ModelElement("li");
      li.addChild(block.clone());
      const list = new ModelElement("ul");
      list.addChild(li);
      parent!.addChild(list, positionToInsert!);
      this.model.removeModelNode(block);
      selection.selectNode(parent);
      selection.collapse();

      this.model.write(parent);

    }
    return;
  }

  /**
   * Construct a model list tree from a matrix of content
   * every row will become a <li> with the row items as its children
   * @param type
   * @param items
   */
  private buildList(type: ElementType, items: ModelNode[][]) {
    const rootNode = new ModelElement(type);
    for (const item of items) {
      const listItem = new ModelElement('li');
      listItem.appendChildren(...item);
      rootNode.addChild(listItem);
    }
    return rootNode;
  }
}
