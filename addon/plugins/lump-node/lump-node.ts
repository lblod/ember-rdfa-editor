import Controller from '@lblod/ember-rdfa-editor/model/controller';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';

export default class LumpNodePlugin implements EditorPlugin {
  controller?: Controller;
  lumpNodePreviouslyBeforeCursor?: ModelNode | null;
  lastPosition?: ModelPosition;
  get name() {
    return 'lump-node';
  }

  initialize(controller: Controller): Promise<void> {
    this.controller = controller;
    controller.onEvent('selectionChanged', this.selectionChanged.bind(this));
    return Promise.resolve();
  }

  selectionChanged() {
    const selection = this.controller?.selection;
    console.log(selection);
    if (selection?.isCollapsed) {
      const lumpNode = lumpNodeBeforeCursor(selection);
      const newPosition = selection.lastRange?.start;
      if (
        this.lumpNodePreviouslyBeforeCursor &&
        !this.lastPosition?.equals(newPosition) &&
        this.lumpNodePreviouslyBeforeCursor.connected &&
        this.lumpNodePreviouslyBeforeCursor.attributeMap.has(
          'data-flagged-remove'
        )
      ) {
        this.controller?.executeCommand(
          'remove-property',
          this.lumpNodePreviouslyBeforeCursor,
          'data-flagged-remove'
        );
      }
      this.lumpNodePreviouslyBeforeCursor = lumpNode;
      this.lastPosition = selection.lastRange?.start;
    } else {
      this.lumpNodePreviouslyBeforeCursor = undefined;
      this.lastPosition = undefined;
    }
  }
}

function lumpNodeBeforeCursor(
  selection: ModelSelection
): ModelNode | undefined | null {
  const start = selection.anchor?.shiftedVisually(-1);
  const end = selection.anchor;
  if (start && end) {
    const lumpNode = GenTreeWalker.fromRange({
      range: new ModelRange(start, end),
      reverse: true,
      filter: toFilterSkipFalse(
        (node) =>
          ModelNode.isModelElement(node) && ModelNodeUtils.isLumpNode(node)
      ),
    }).nextNode();
    return lumpNode;
  }
  return;
}
