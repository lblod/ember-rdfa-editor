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
    let startOfTheElement = range.start;
    if(range.start.nodeBefore()){
      startOfTheElement = ModelPosition.fromBeforeNode(range.start.nodeBefore());
    }
    const firstPositionAtDocument = this.model.modelRoot.getFirstPositionInside();
    const searchRange = new ModelRange(firstPositionAtDocument, startOfTheElement);
    let previousElement: ModelNode | undefined;
    if(!searchRange.collapsed){
      const treeWalker = new ModelTreeWalker({
        filter: (node) => node.isBlock || ModelNode.isModelText(node) ? FilterResult.FILTER_ACCEPT : FilterResult.FILTER_SKIP,
        range: searchRange,
      });
      const nodeArray = [...treeWalker];
      previousElement = nodeArray[nodeArray.length - 1];
    }
    if(previousElement) {
      this.model.change(executedBy, _ => {
          const firstPosition = previousElement.getLastPositionInside();
          range.start = firstPosition;
          range.end = firstPosition;
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
