import Command from "@lblod/ember-rdfa-editor/core/command";
import {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import { INVISIBLE_SPACE } from "@lblod/ember-rdfa-editor/util/constants";
import ModelTreeWalker, { FilterResult } from "@lblod/ember-rdfa-editor/util/model-tree-walker";

export default class MoveToNextElement extends Command<[ModelRange], void> {
  name = 'move-to-next-element';

  constructor(model: MutableModel) {
    super(model);
  }

  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange) {
    if(!range) return; 
    const lastDocumentPosition = this.model.modelRoot.getLastPositionInside();
    const searchRange = new ModelRange(range.start, lastDocumentPosition);
    let nextElement: ModelNode | null = null;
    if(!searchRange.collapsed) {
      const treeWalker = new ModelTreeWalker({
        filter: (node) => node.isBlock || ModelNode.isModelText(node) ? FilterResult.FILTER_ACCEPT : FilterResult.FILTER_SKIP,
        range: searchRange
      });
      if(range.start.parentOffset === range.start.parent.getMaxOffset()) {
        nextElement = treeWalker.currentNode;
      } else {
        nextElement = treeWalker.nextNode();
      }
    }
    if(nextElement) {
      this.model.change(executedBy, _ => {
        const firstPosition = nextElement!.getFirstPositionInside();
        range.start = firstPosition;
        range.end = firstPosition;
        this.model.selection.selectRange(range);
      });
    } else {
      const invisibleSpace = new ModelText(INVISIBLE_SPACE);
      this.model.change(executedBy, mutator => {
        mutator.insertAtPosition(lastDocumentPosition, invisibleSpace);
        const invisibleSpacePosition = ModelPosition.fromInNode(invisibleSpace, 0);
        range.start = invisibleSpacePosition;
        range.end = invisibleSpacePosition;
        this.model.selection.selectRange(range);
      });
    }
  }
}
