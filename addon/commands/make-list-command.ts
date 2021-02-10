import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelSelection, {WellbehavedSelection} from "@lblod/ember-rdfa-editor/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelElement, {ElementType} from "../model/model-element";
import {MisbehavedSelectionError, NoParentError, NoTopSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {listTypes} from "@lblod/ember-rdfa-editor/model/util/constants";
import ListCleaner from "@lblod/ember-rdfa-editor/model/cleaners/list-cleaner";


/**
 * command will convert all nodes in the selection to a list if they are not already in a list
 */
export default class MakeListCommand extends Command {
  name = "make-list";

  constructor(model: Model) {
    super(model);
  }


  execute(listType: "ul" | "ol", selection: ModelSelection = this.model.selection) {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const {interestingNodes, whereToInsert, positionToInsert} = this.collectInterestingNodes(selection);
    if (!whereToInsert) {
      throw new NoParentError();
    }

    const items = this.nodesToItems(interestingNodes);

    let container: ModelElement;
    if (items) {
      for (const node of interestingNodes) {
        this.model.removeModelNode(node);
      }
      const {parent, listNode} = this.wrapItems(items, whereToInsert, positionToInsert, listType);
      container = parent;

      selection.selectNode(listNode);
    } else {
      const item = selection.getCommonAncestor().parent;
      const block = this.getTopBlockNode(item) as ModelElement;
      const {parent, listNode} = this.wrapSingleItem(block, listType);
      container = parent;
      if(ModelNode.isModelElement(listNode.firstChild)) {
        selection.selectNode(listNode.firstChild.firstChild);
      } else {
        selection.selectNode(listNode.firstChild);
      }
      selection.collapse();
      this.model.removeModelNode(block);
    }
    const cleaner = new ListCleaner();
    cleaner.clean(this.model.rootModelNode);
    this.model.write(container);
    return;
  }

  /**
   * Given a well-behaved selection, find the nodes we care about, and calculate the insertion point for
   * the eventual list
   * @param selection
   * @private
   */
  private collectInterestingNodes(selection: WellbehavedSelection) {
    const interestingPositions = selection.lastRange.getSelectedTopPositions();
    if (!interestingPositions) {
      throw new NoTopSelectionError();
    }
    const interestingNodes = interestingPositions.map(pos => pos.parent);
    const whereToInsert = interestingPositions[0].parent.parent;
    const positionToInsert = interestingPositions[0].parent.index!;
    return {interestingNodes, whereToInsert, positionToInsert};
  }

  /**
   * Given a 2d matrix of nodes, build a list with each row of the matrix inside a list item, then
   * insert it into the whereToInsert node at positionToInsert.
   * @param items
   * @param whereToInsert
   * @param positionToInsert
   * @param listType
   * @private
   */
  private wrapItems(items: ModelNode[][], whereToInsert: ModelElement, positionToInsert: number, listType: "ul" | "ol"): { parent: ModelElement, listNode: ModelElement } {
    const list = this.buildList(listType, items);

    whereToInsert.addChild(list, positionToInsert);
    return {parent: whereToInsert, listNode: list};
  }

  /**
   * Given a block element, wrap in it a new list.
   * Return the new list node.
   * @param block
   * @param listType
   * @private
   */
  private wrapSingleItem(block: ModelElement, listType: "ul" | "ol"): { parent: ModelElement, listNode: ModelElement } {
    const parent = block.parent;
    if (!parent) {
      throw new NoParentError();
    }
    const positionToInsert = block.index;
    const li = new ModelElement("li");
    li.addChild(block.clone());
    const list = new ModelElement(listType);
    list.addChild(li);
    parent.addChild(list, positionToInsert!);

    return {parent, listNode: list};
  }

  /**
   * Given a set of nodes we care about, build a 2d matrix with each row representing the contents of a listItem
   * If no full row can be built from the nodes (because there is no block element or linebreak), return null
   * @param interestingNodes
   * @private
   */
  private nodesToItems(interestingNodes: ModelNode[]): ModelNode[][] | null {
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
        if (node.hasVisibleText()) {
          ArrayUtils.pushOrCreate(items, index, node);
        }
      }
    }
    if (!hasBlocks) {
      return null;
    }
    return items;
  }

  /**
   * Given a node, find the first ancestor which is a blockNode
   * @param node
   * @private
   */
  private getTopBlockNode(node: ModelNode): ModelNode | null {
    if (node.isBlock) return node;
    const parent = node.parent;
    if (!(parent && parent.parent)) return node;
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
