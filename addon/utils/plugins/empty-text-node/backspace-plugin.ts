import {
  ManipulationGuidance,
  RemoveCharacterManipulation,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {
  BackspaceHandlerManipulation,
  BackspacePlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import {
  moveCaretBefore,
  moveCaret,
  stringToVisibleText,
} from '@lblod/ember-rdfa-editor/editor/utils';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import { Editor } from '@lblod/ember-rdfa-editor/core/editor';

/**
 * In some cases the browser acts a bit weird when we empty a text node. This plugin tries to handle these edge cases.
 * Specific reasons we do this:
 *  - Chrome removes empty text nodes immediately after setting an empty textContent and firefox doesn't.
 *  - Firefox and Chrome have issues showing the caret where we expect them in some edge cases (empty text node between blocks for example).
 */
export default class EmptyTextNodeBackspacePlugin implements BackspacePlugin {
  label = 'Backspace plugin for properly handling empty text nodes';

  guidanceForManipulation(
    manipulation: BackspaceHandlerManipulation
  ): ManipulationGuidance | null {
    if (manipulation.type === 'removeCharacter') {
      if (
        manipulation.position === 0 &&
        manipulation.node.textContent?.length === 1
      ) {
        return {
          allow: true,
          executor: this.replaceLastCharacterWithInvisibleSpace,
        };
      } else if (
        this.manipulationWillResultInTextNodeWithoutText(manipulation)
      ) {
        return {
          allow: true,
          executor: this.replaceLastCharacterWithInvisibleSpace,
        };
      }
    }

    return null;
  }

  manipulationWillResultInTextNodeWithoutText(
    manipulation: RemoveCharacterManipulation
  ): boolean {
    const nodeText = manipulation.node.textContent || '';
    const position = manipulation.position;
    return (
      stringToVisibleText(
        `${nodeText.slice(0, position)}${nodeText.slice(position + 1)}`
      ).length === 0
    );
  }

  /**
   * Replace text node content with an invisible space and position cursor at the beginning of the node.
   */
  replaceLastCharacterWithInvisibleSpace = (
    manipulation: RemoveCharacterManipulation,
    editor: Editor
  ) => {
    const { node } = manipulation;
    node.textContent = INVISIBLE_SPACE;
    window.getSelection()?.collapse(node, 0);
    moveCaret(node, 0);
    const tr = editor.state.createTransaction();
    tr.readFromView(editor.view);
    editor.dispatchTransaction(tr, false);
  };

  /**
   * This remove the text node completely.
   */
  removeTextNode(manipulation: RemoveCharacterManipulation, editor: Editor) {
    const element = manipulation.node;

    if (element.parentElement) {
      moveCaretBefore(element);

      element.remove();
      const tr = editor.state.createTransaction();
      tr.readFromView(editor.view);
      editor.dispatchTransaction(tr, false);
    }
  }

  /**
   * Allows the plugin to notify the backspace handler a change has occurred.
   * Currently never detects a change, but rather lets the backspace handler do detection.
   * @method detectChange
   */
  detectChange(): boolean {
    return false;
  }
}
