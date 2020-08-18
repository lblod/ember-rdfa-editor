import { TabInputPlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import { Editor, Manipulation, ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { isInLumpNode, getParentLumpNode } from '@lblod/ember-rdfa-editor/utils/ce/lump-node-utils';
import { invisibleSpace } from '@lblod/ember-rdfa-editor/utils/ce/dom-helpers';

/**
 *
 * @class LumpNodeTabInputPlugin
 * @module plugin/lump-node
 */
export default class LumpNodeTabInputPlugin implements TabInputPlugin {
  label = 'Tap input plugin for handling LumpNodes'

  isSupportedManipulation(manipulation : Manipulation) : boolean {
    return manipulation.type  === 'moveCursorInsideNonVoidAndVisibleElementAtStart'
      || manipulation.type  === 'moveCursorInsideNonVoidAndVisibleElementAtEnd';
  }

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    if( !this.isSupportedManipulation(manipulation) ){
      console.info(`plugins/lump-node/tab-input-plugin: manipulation ${manipulation.type} not supported for lumpNode`);
      return null;
    }

    const element = manipulation.node as HTMLElement;
    const rootNode = element.getRootNode(); //Assuming here that node is attached.
    const isElementInLumpNode = isInLumpNode(element, rootNode);

    if(manipulation.type  === 'moveCursorInsideNonVoidAndVisibleElementAtStart' && isElementInLumpNode){
      return {
        allow: true,
        executor: this.jumpOverLumpNode
      };
    }
    else if(manipulation.type  === 'moveCursorInsideNonVoidAndVisibleElementAtEnd' && isElementInLumpNode){
      return {
        allow: true,
        executor: this.jumpOverLumpNodeBackwards
      };
    }

    return null;
  }

  jumpOverLumpNode(manipulation: Manipulation, editor: Editor) : void {
    const element = getParentLumpNode(manipulation.node, manipulation.node.getRootNode()) as HTMLElement; //we can safely assume this
    if(element.nextSibling && element.nextSibling.nodeType == Node.TEXT_NODE){
      //TODO: what if textNode does contain only invisible white space? Then user won't see any jumps.
      const textNode = element.nextSibling;
      editor.updateRichNode();
      editor.setCarret(textNode, 0);
    }

    else {
      //Adding invisibleSpace the user notices cursor jump
      //TODO: probably some duplicat logic wit editor.setCarret
      const textNode = document.createTextNode(invisibleSpace);
      element.after(textNode);
      editor.updateRichNode();
      editor.setCarret(textNode, textNode.length);
    }
  }

  jumpOverLumpNodeBackwards( manipulation: Manipulation, editor: Editor ) : void {
    const element = getParentLumpNode(manipulation.node, manipulation.node.getRootNode()) as HTMLElement; //we can safely assume this
    if(element.previousSibling && element.previousSibling.nodeType == Node.TEXT_NODE){
      //TODO: what if textNode does contain only invisible white space? Then user won't see any jumps.
      const textNode = element.previousSibling as Text;
      editor.updateRichNode();
      editor.setCarret(textNode, textNode.length);
    }

    else {
      //Adding invisibleSpace the user notices cursor jump
      //TODO: probably some duplicat logic wit editor.setCarret
      const textNode = document.createTextNode(invisibleSpace);
      element.before(textNode);
      editor.updateRichNode();
      editor.setCarret(textNode, 0);
    }
  }
}
