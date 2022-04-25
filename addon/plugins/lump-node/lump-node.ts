import Controller from '@lblod/ember-rdfa-editor/model/controller';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import { LUMP_NODE_PROPERTY } from '@lblod/ember-rdfa-editor/model/util/constants';
import { action } from '@ember/object';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';


export default class LumpNodePlugin implements EditorPlugin {
  controller?: Controller;
  lumpNodePreviouslyBeforeCursor?: ModelElement;
  lastPosition?: ModelPosition;
  get name() {
    return 'lump-node';
  }

  initialize(controller: Controller): Promise<void> {
    this.controller = controller;
    controller.onEvent('selectionChanged', this.selectionChanged);
    return Promise.resolve();
  }

  @action
  selectionChanged() {
    const selection = this.controller?.selection;
    if (selection?.isCollapsed) {
      const lumpNode = lumpNodeBeforeCursor(selection);
      const newPosition = selection.lastRange?.start;
      if (this.lumpNodePreviouslyBeforeCursor && ! this.lastPosition?.equals(newPosition) ) {
        this.controller?.executeCommand('remove-property', this.lumpNodePreviouslyBeforeCursor, 'data-flagged-remove');
      }
      this.lumpNodePreviouslyBeforeCursor = lumpNode;
      this.lastPosition = selection.lastRange?.start;
    } else {
      this.lumpNodePreviouslyBeforeCursor = undefined;
      this.lastPosition = undefined;
    }
  }
}

function lumpNodeBeforeCursor(selection: ModelSelection): ModelElement | undefined {
  const previousSibling = selection.anchor?.nodeBefore();
  console.log(previousSibling)
  if (previousSibling && ModelNode.isModelElement(previousSibling)) {
    const properties = previousSibling.getRdfaAttributes().properties;
    if (properties && properties.includes(LUMP_NODE_PROPERTY))
      return previousSibling;
  }
  return;
}
