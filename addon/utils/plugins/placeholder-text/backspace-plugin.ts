import { BackspacePlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import { Manipulation, ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';

/**
 *
 * @class PlaceholderTextBackspacePlugin
 * @module plugins/placeholder-text
 */
export default class PlaceholderTextBackspacePlugin implements BackspacePlugin {
  label = 'backspace plugin for handling placeholder nodes'

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    const node = manipulation.node;
    const parentNode = node.parentElement;
    if(parentNode && parentNode.classList.contains('mark-highlight-manual')) {
      return {
        allow: true,
        executor: this.removePlaceholder
      };
    }
    return null;
  }

  /**
   * This executor removes the placeholder node containing manipulation.node competly.
   * @method removePlaceholder
   */
  removePlaceholder(manipulation: Manipulation) : void {
    const node = manipulation.node;
    const parentNode = node.parentElement;
    if(parentNode) {
      parentNode.remove();
    }
  }

  /**
   * Allows the plugin to notify the backspace handler a change has occured.
   * Returns true explicitly when it detects the manipulation.node is inside a placeholder node.
   * @method detectChange
   */
  detectChange( manipulation: Manipulation ) : boolean {
    const node = manipulation.node;
    const parentNode = node.parentNode;
    if(parentNode && parentNode.classList.contains('mark-highlight-manual')) {
      return true;
    }
    return false;
  }

}
