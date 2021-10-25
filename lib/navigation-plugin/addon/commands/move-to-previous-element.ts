import Command from "@lblod/ember-rdfa-editor/core/command";
import {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelTreeWalker, { FilterResult } from "@lblod/ember-rdfa-editor/util/model-tree-walker";
import { INVISIBLE_SPACE } from "@lblod/ember-rdfa-editor/util/constants";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";

export default class MoveToPreviousElement extends Command<[ModelRange], void> {
  name = 'move-to-previous-element';

  constructor(model: MutableModel) {
    super(model);
  }

  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange) {
    if(!range) return;
    const firstPositionAtDocument = this.model.modelRoot.getFirstPositionInside();
    const searchRange = new ModelRange(firstPositionAtDocument, range.start);
    let previousElement: ModelNode | undefined;
    if(!searchRange.collapsed){
      const treeWalker = new ModelTreeWalker({
        filter: (node) => node.isBlock || ModelNode.isModelText(node) ? FilterResult.FILTER_ACCEPT : FilterResult.FILTER_SKIP,
        range: searchRange,
      });
      const nodeArray = [...treeWalker];
      if(range.start.parentOffset === 0) {
        if(nodeArray[nodeArray.length - 1] === range.start.parent) {
          previousElement = nodeArray[nodeArray.length - 2];
        } else {
          previousElement = nodeArray[nodeArray.length - 1];
        }
      } else {
        previousElement = nodeArray[nodeArray.length - 2];
      }
    }
    if(previousElement) {
      this.model.change(executedBy, _ => {
        let position;
        if(ModelNode.isModelText(previousElement)) {
          position = previousElement.getLastPositionInside();
        } else {
          position = previousElement.getFirstPositionInside();
        }
        range.start = position;
        range.end = position;
        this.model.selection.selectRange(range);
      });
    } else {
      const invisibleSpace = new ModelText(INVISIBLE_SPACE);
      this.model.change(executedBy, mutator => {
        mutator.insertAtPosition(firstPositionAtDocument, invisibleSpace);
        const invisibleSpacePosition = ModelPosition.fromInNode(invisibleSpace, 0);
        range.start = invisibleSpacePosition;
        range.end = invisibleSpacePosition;
        this.model.selection.selectRange(range);
      });
    }
  }
}
