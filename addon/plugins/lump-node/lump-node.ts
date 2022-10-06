import { deleteTargetRange } from '@lblod/ember-rdfa-editor/input/utils';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';

export default class LumpNodePlugin implements EditorPlugin {
  controller!: Controller;
  lumpNodePreviouslyBeforeCursor?: ModelNode | null;
  lastPosition?: ModelPosition;

  get name() {
    return 'lump-node';
  }

  initialize(_transaction: Transaction, controller: Controller): Promise<void> {
    this.controller = controller;
    controller.onEvent('selectionChanged', this.selectionChanged.bind(this));
    return Promise.resolve();
  }

  selectionChanged() {
    this.controller?.perform((tr) => {
      const selection = tr.currentSelection;
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
          tr.commands.removeProperty({
            node: this.lumpNodePreviouslyBeforeCursor,
            property: 'data-flagged-remove',
          });
        }
        this.lumpNodePreviouslyBeforeCursor = lumpNode;
        this.lastPosition = selection.lastRange?.start;
      } else {
        this.lumpNodePreviouslyBeforeCursor = undefined;
        this.lastPosition = undefined;
      }
    });
  }

  handleEvent(event: InputEvent): { handled: boolean } {
    switch (event.inputType) {
      case 'deleteContentBackward':
        return this.handleDelete(event, -1);
      case 'deleteContentForward':
        return this.handleDelete(event, 1);
      default:
        return { handled: false };
    }
  }

  handleDelete(event: InputEvent, direction: number): { handled: boolean } {
    const range = deleteTargetRange(this.controller.currentState, direction);
    const lumpNode = GenTreeWalker.fromRange({
      range,
      reverse: direction === -1,
      filter: toFilterSkipFalse(
        (node) =>
          ModelNode.isModelElement(node) && ModelNodeUtils.isLumpNode(node)
      ),
    }).nextNode();
    if (lumpNode) {
      if (lumpNode.getAttribute('data-flagged-remove') !== 'complete') {
        this.controller.perform((tr) => {
          tr.commands.setProperty({
            property: 'data-flagged-remove',
            value: 'complete',
            element: lumpNode as ModelElement,
          });
        });
        event.preventDefault();
        return { handled: true };
      }
    }
    return { handled: false };
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
      filter: toFilterSkipFalse<ModelNode>(
        (node) =>
          ModelNode.isModelElement(node) && ModelNodeUtils.isLumpNode(node)
      ),
    }).nextNode();
    return lumpNode;
  }
  return;
}

//   guidanceForManipulation(
//     manipulation: TabHandlerManipulation
//   ): ManipulationGuidance | null {
//     if (!this.isSupportedManipulation(manipulation)) {
//       return null;
//     }

//     const element = manipulation.node;
//     const rootNode = element.getRootNode(); //Assuming here that node is attached.
//     const isElementInLumpNode = isInLumpNode(element, rootNode as HTMLElement);

//     if (
//       manipulation.type === 'moveCursorToStartOfElement' &&
//       isElementInLumpNode
//     ) {
//       return {
//         allow: true,
//         executor: this.jumpOverLumpNode,
//       };
//     } else if (
//       manipulation.type === 'moveCursorToEndOfElement' &&
//       isElementInLumpNode
//     ) {
//       return {
//         allow: true,
//         executor: this.jumpOverLumpNodeBackwards,
//       };
//     }

//     return null;
//   }

//   jumpOverLumpNode = (
//     manipulation: TabHandlerManipulation,
//     editor: Editor
//   ): void => {
//     const node = manipulation.node;
//     const rootNode = node.getRootNode() as HTMLElement;
//     const element = getParentLumpNode(node, rootNode); // We can safely assume this.
//     if (!element) {
//       throw new Error('No parent lump node found');
//     }

//     let textNode;
//     if (element.nextSibling && isTextNode(element.nextSibling)) {
//       textNode = element.nextSibling;
//     } else {
//       textNode = document.createTextNode('');
//       element.after(textNode);
//     }

//     textNode = ensureValidTextNodeForCaret(textNode);
//     window.getSelection()?.collapse(textNode, 0);
//     const tr = editor.state.createTransaction();
//     tr.readFromView(editor.view);
//     editor.dispatchTransaction(tr, false);
//   };

//   jumpOverLumpNodeBackwards = (
//     manipulation: TabHandlerManipulation,
//     editor: Editor
//   ): void => {
//     const node = manipulation.node;
//     const rootNode = node.getRootNode() as HTMLElement;
//     const element = getParentLumpNode(node, rootNode);
//     if (!element) {
//       throw new Error('No parent lump node found');
//     }

//     let textNode;
//     if (element.previousSibling && isTextNode(element.previousSibling)) {
//       textNode = element.previousSibling;
//     } else {
//       textNode = document.createTextNode('');
//       element.before(textNode);
//     }

//     textNode = ensureValidTextNodeForCaret(textNode);
//     window.getSelection()?.collapse(textNode, textNode.length);
//     const tr = editor.state.createTransaction();
//     tr.readFromView(editor.view);
//     editor.dispatchTransaction(tr, false);
//   };
// }
