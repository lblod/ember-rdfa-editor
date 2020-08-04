import { BackspacePlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import { Editor, Manipulation, ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { isInLumpNode, getParentLumpNode  } from '@lblod/ember-rdfa-editor/utils/ce/lump-node-utils';

/**
 *
 * @class LumpNodeBackspacePlugin
 * @module plugin/lump-node
 */
export default class LumpNodeBackspacePlugin implements BackspacePlugin {
  label = 'backspace plugin for handling LumpNodes'

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    const node = manipulation.node;
    const parentNode = node.parentNode
    if(parentNode && parentNode.classList.contains('mark-highlight-manual')) {
      return {
        allow: true,
        executor: this.removePlaceholder
      }
    }
    return null;
  }

  removePlaceholder(manipulation: Manipulation, editor: Editor) : void {
    console.log('Remove placeholder called')
    const node = manipulation.node;
    const parentNode = node.parentNode
    parentNode.remove();
  }

}
