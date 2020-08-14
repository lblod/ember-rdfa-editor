import { TabInputPlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import { Editor, Manipulation, ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { isInLumpNode } from '@lblod/ember-rdfa-editor/utils/ce/lump-node-utils';

/**
 *
 * @class LumpNodeTabInputPlugin
 * @module plugin/lump-node
 */
export default class LumpNodeTabInputPlugin implements TabInputPlugin {
  label = 'Tap input plugin for handling LumpNodes'

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    //TODO: fix case.manipulation.node == lumpnode

    if( manipulation.type !== 'moveCursorInsideNonVoidAndVisibleElementAtStart' ){
      console.info(`plugins/lump-node/tab-input-plugin: manipulation ${manipulation.type} not supported for lumpNode`);
      return null;
    }

    const element = manipulation.node as HTMLElement;
    const rootNode = element.getRootNode(); //Assuming here that node is attached.
    const isElementInLumpNode = isInLumpNode(element, rootNode);

    if(isElementInLumpNode){
      return {
        allow: true,
        executor: this.jumpOverLumpNode
      }
    }

    return null;
  }

  jumpOverLumpNode(manipulation: Manipulation, editor: Editor) : void {
    const element = manipulation.node as HTMLElement;
    let textNode;
    if(element.nextSibling && element.nextSibling.nodeType == Node.TEXT_NODE){
      textNode = element.nextSibling;
    }
    else {
      textNode = document.createTextNode('');
      element.after(textNode);
    }

    editor.updateRichNode();
    editor.setCarret(textNode, 0);
  }
}
