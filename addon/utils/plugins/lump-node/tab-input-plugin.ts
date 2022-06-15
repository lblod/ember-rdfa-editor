import {
  TabHandlerManipulation,
  TabInputPlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import {
  Manipulation,
  ManipulationGuidance,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {
  isInLumpNode,
  getParentLumpNode,
} from '@lblod/ember-rdfa-editor/utils/ce/lump-node-utils';
import { ensureValidTextNodeForCaret } from '@lblod/ember-rdfa-editor/editor/utils';
import { isTextNode } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { Editor } from '@lblod/ember-rdfa-editor/core/editor';

/**
 *
 * @class LumpNodeTabInputPlugin
 * @module plugin/lump-node
 */
export default class LumpNodeTabInputPlugin implements TabInputPlugin {
  label = 'Tab input plugin for handling lumpNodes';

  isSupportedManipulation(manipulation: Manipulation): boolean {
    return (
      manipulation.type === 'moveCursorToStartOfElement' ||
      manipulation.type === 'moveCursorToEndOfElement'
    );
  }

  guidanceForManipulation(
    manipulation: TabHandlerManipulation
  ): ManipulationGuidance | null {
    if (!this.isSupportedManipulation(manipulation)) {
      return null;
    }

    const element = manipulation.node;
    const rootNode = element.getRootNode(); //Assuming here that node is attached.
    const isElementInLumpNode = isInLumpNode(element, rootNode as HTMLElement);

    if (
      manipulation.type === 'moveCursorToStartOfElement' &&
      isElementInLumpNode
    ) {
      return {
        allow: true,
        executor: this.jumpOverLumpNode,
      };
    } else if (
      manipulation.type === 'moveCursorToEndOfElement' &&
      isElementInLumpNode
    ) {
      return {
        allow: true,
        executor: this.jumpOverLumpNodeBackwards,
      };
    }

    return null;
  }

  jumpOverLumpNode = (
    manipulation: TabHandlerManipulation,
    editor: Editor
  ): void => {
    const node = manipulation.node;
    const rootNode = node.getRootNode() as HTMLElement;
    const element = getParentLumpNode(node, rootNode); // We can safely assume this.
    if (!element) {
      throw new Error('No parent lump node found');
    }

    let textNode;
    if (element.nextSibling && isTextNode(element.nextSibling)) {
      textNode = element.nextSibling;
    } else {
      textNode = document.createTextNode('');
      element.after(textNode);
    }

    textNode = ensureValidTextNodeForCaret(textNode);
    window.getSelection()?.collapse(textNode, 0);
    const tr = editor.state.createTransaction();
    tr.readFromView(editor.view);
    editor.dispatchTransaction(tr, false);
  };

  jumpOverLumpNodeBackwards = (
    manipulation: TabHandlerManipulation,
    editor: Editor
  ): void => {
    const node = manipulation.node;
    const rootNode = node.getRootNode() as HTMLElement;
    const element = getParentLumpNode(node, rootNode);
    if (!element) {
      throw new Error('No parent lump node found');
    }

    let textNode;
    if (element.previousSibling && isTextNode(element.previousSibling)) {
      textNode = element.previousSibling;
    } else {
      textNode = document.createTextNode('');
      element.before(textNode);
    }

    textNode = ensureValidTextNodeForCaret(textNode);
    window.getSelection()?.collapse(textNode, textNode.length);
    const tr = editor.state.createTransaction();
    tr.readFromView(editor.view);
    editor.dispatchTransaction(tr, false);
  };
}
