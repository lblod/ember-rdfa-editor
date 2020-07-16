import { BackspacePlugin,
         Editor,
         Manipulation,
         ManipulationGuidance
       } from '../../ce/handlers/backspace-handler';
import { isInLumpNode, getParentLumpNode, getPreviousNonLumpTextNode } from '../../ce/lump-node-utils';

//We favour to be defensive in the stuff we accept.
const SUPPORTED_MANIPULATIONS = [
  "removeEmptyTextNode",
  "removeCharacter",
  "removeEmptyElement",
  "removeVoidElement",
  "moveCursorToEndOfNode",
  "moveCursorBeforeElement",
  "removeOtherNode",
  "removeElementWithOnlyInvisibleTextNodeChildren",
  "removeElementWithChildrenThatArentVisible",
];


/**
 *
 * @class LumpNodeBackspacePlugin
 * @module plugin/lump-node
 */
export default class LumpNodeBackspacePlugin implements BackspacePlugin {
  label = 'backspace plugin for handling LumpNodes'

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    const node = manipulation.node;
    const rootNode = node.getRootNode(); //Assuming here that node is attached.
    const isElementInLumpNode = isInLumpNode(node, rootNode);
    const isManipulationSupported = this.isSupportedManipulation(manipulation);

    if(isElementInLumpNode && !isManipulationSupported){
      console.warn(`plugins/lump-node/backspace-plugin: manipulation ${manipulation.type} not supported for lumpNode`);
      return null;
    }

    else if(isElementInLumpNode){
      const parentLumpNode = getParentLumpNode(node, rootNode) as Element; //we can safely assume this

      if(this.isElementFlaggedForRemoval(parentLumpNode)){
        return {
          allow: true,
          executor: this.removeLumpNode
        }
      }
      else {
        return {
          allow: true,
          executor: this.flagForRemoval
        }
      }
    }

    return null;
  }

  removeLumpNode( manipulation: Manipulation, editor: Editor ) : void {
    const node = manipulation.node;
    const rootNode = node.getRootNode();
    const nodeToDeleteAsBlock = getParentLumpNode(node, rootNode);
    const previousNode = getPreviousNonLumpTextNode(nodeToDeleteAsBlock, rootNode);
    nodeToDeleteAsBlock.remove();
    editor.updateRichNode();
    editor.setCarret(previousNode, previousNode.length);
  }

  detectChange( manipulation: Manipulation ) : boolean {
    const node = manipulation.node;
    const rootNode = node.getRootNode();

    if(!node.isConnected){
      return false; //Node has been removed, relying here on visualChange from backspace handler...
    }

    const isElementInLumpNode = isInLumpNode(node, rootNode);
    const isManipulationSupported = this.isSupportedManipulation(manipulation);

    if(isElementInLumpNode && isManipulationSupported){
      //State:
      // - somehow the manipulation hasn't been removed (either not flagged, or an issue)
      // We want the user to press again.
      return true;
    }

    // Other cases, we ignore, or this plugin did its job: it removed a lumpNode. We expect visual change
    return false;
  }

  isSupportedManipulation( manipulation: Manipulation ) : boolean {
    return SUPPORTED_MANIPULATIONS.some( m => m === manipulation.type );
  }

  isElementFlaggedForRemoval( element: Element ) : boolean {
    return element.getAttribute('data-flagged-remove') === "complete";
  }

  flagForRemoval( manipulation: Manipulation, _editor: Editor) : void {
    const node = manipulation.node;
    const rootNode = node.getRootNode();
    const lumpNode = getParentLumpNode(node, rootNode) as Element;
    lumpNode.setAttribute('data-flagged-remove', 'complete');
  }

}
