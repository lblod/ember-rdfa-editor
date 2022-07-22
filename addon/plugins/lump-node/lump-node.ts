import Controller from '@lblod/ember-rdfa-editor/model/controller';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import Operation from '@lblod/ember-rdfa-editor/model/operations/operation';

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

  onTransactionStep(transaction: Transaction, operation: Operation) {
    const selection = transaction.currentSelection;
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
      filter: toFilterSkipFalse<ModelNode>(
        (node) =>
          ModelNode.isModelElement(node) && ModelNodeUtils.isLumpNode(node)
      ),
    }).nextNode();
    return lumpNode;
  }
  return;
}

// guidanceForManipulation(
//   manipulation: BackspaceHandlerManipulation
// ): ManipulationGuidance | null {
//   //TODO: Fix case.manipulation.node === lump node
//   const node = manipulation.node;
//   const rootNode = node.getRootNode() as HTMLElement; // Assuming here that node is attached.
//   let parentLump = getParentLumpNode(node, rootNode);

//   if (manipulation.type === 'removeEmptyTextNode' && !parentLump) {
//     const prevSibling = manipulation.node.previousSibling;
//     if (prevSibling) {
//       parentLump = getParentLumpNode(prevSibling, rootNode);
//     }

//   if (!parentLump) {
//     return null;
//   }

//   if (!this.isSupportedManipulation(manipulation)) {
//     console.warn(
//       `plugins/lump-node/backspace-plugin: manipulation ${manipulation.type} not supported for lumpNode`
//     );

//     return null;
//   } else {
//     if (this.isElementFlaggedForRemoval(parentLump)) {
//       return {
//         allow: true,
//         executor: (_, editor: Editor) => {
//           this.removeLumpNode(parentLump!, editor);
//         },
//       };
//     } else {
//       return {
//         allow: true,
//         executor: () => {
//           this.flagForRemoval(parentLump!);
//         },
//       };
//     }
//   }
// }

// /**
//  * This executor removes the LumpNode containing manipulation.node completely.
//  * It assumes manipulation.node is located in a LumpNode.
//  * @method removeLumpNode
//  */
// removeLumpNode = (lumpNode: Element, editor: Editor): void => {
//   const parentOfLumpNode = lumpNode.parentNode;
//   if (!parentOfLumpNode) {
//     throw new Error("Lump node doesn't have parent node");
//   }

//   const offset = Array.from(parentOfLumpNode.childNodes).indexOf(lumpNode);
//   lumpNode.remove();
//   window.getSelection()?.collapse(parentOfLumpNode, offset);
//   const tr = editor.state.createTransaction();
//   tr.readFromView(editor.view);
//   editor.dispatchTransaction(tr, false);
// };

// /**
//  * Allows the plugin to notify the backspace handler a change has occurred.
//  * Returns true explicitly when it detects the manipulation.node is in LumpNode.
//  *  This is the case when flag for removal has been set.
//  * Other cases, we rely on the detectVisualChange from backspace handler
//  * @method detectChange
//  */
// detectChange(manipulation: BackspaceHandlerManipulation): boolean {
//   if (!manipulation.node.isConnected) {
//     return false;
//   }

//   // We always do a visual change in this plugin, so we need the exact same logic.
//   // This could be solved more efficiently with state, but that is not recommended for handler plugins.
//   return !!this.guidanceForManipulation(manipulation);
// }

// /**
//  * Checks whether manipulation is supported.
//  * @method isSupportedManipulation
//  */
// isSupportedManipulation(manipulation: Manipulation): boolean {
//   return SUPPORTED_MANIPULATIONS.some((m) => m === manipulation.type);
// }

// /**
//  * Checks whether element is flagged for removal.
//  * @method isElementFlaggedForRemoval
//  */
// isElementFlaggedForRemoval(element: Element): boolean {
//   return element.getAttribute('data-flagged-remove') === 'complete';
// }

// /**
//  * Flags the LumpNode for removal.
//  * @method flagForRemoval
//  */
// flagForRemoval = (lumpNode: Element): void => {
//   lumpNode.setAttribute('data-flagged-remove', 'complete');
// };

// /**
//  *
//  * @class LumpNodeTabInputPlugin
//  * @module plugin/lump-node
//  */
// export default class LumpNodeTabInputPlugin implements TabInputPlugin {
//   label = 'Tab input plugin for handling lumpNodes';

//   isSupportedManipulation(manipulation: Manipulation): boolean {
//     return (
//       manipulation.type === 'moveCursorToStartOfElement' ||
//       manipulation.type === 'moveCursorToEndOfElement'
//     );
//   }

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

// export class LumpNodeBackspaceDeleteInputPlugin
//   implements BackspaceDeletePlugin
// {
//   label = 'Backspace/Delete plugin for handling lump nodes in a range';
//   guidanceForManipulation(
//     manipulation: BackspaceDeleteHandlerManipulation,
//     editor: rawEditor
//   ): ManipulationGuidance | null {
//     const { range, direction } = manipulation;
//     const lumpNode = GenTreeWalker.fromRange({
//       range,
//       reverse: direction === -1,
//       filter: toFilterSkipFalse(
//         (node) =>
//           ModelNode.isModelElement(node) && ModelNodeUtils.isLumpNode(node)
//       ),
//     }).nextNode();
//     if (lumpNode) {
//       if (lumpNode.getAttribute('data-flagged-remove') !== 'complete') {
//         return {
//           allow: true,
//           executor: () => {
//             editor.model.change(() => {
//               lumpNode.setAttribute('data-flagged-remove', 'complete');
//             });
//           },
//         };
//       }
//     }
//     return null;
//   }
// }
