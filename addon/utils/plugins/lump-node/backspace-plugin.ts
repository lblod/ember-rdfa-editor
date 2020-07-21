import { BackspacePlugin,
         Editor,
         Manipulation,
         ManipulationGuidance
       } from '../../ce/handlers/backspace-handler';
import { isInLumpNode, getParentLumpNode  } from '../../ce/lump-node-utils';

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
    //TODO: fix case.manipulation.node == lumpnode
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

  /**
   * This executor removes the LumpNode containing manipulation.node competly.
   * It assumes manipulation.node is located in a LumpNode
   * @method removeLumpNode
   */
  removeLumpNode( manipulation: Manipulation, editor: Editor ) : void {
    const node = manipulation.node;
    const rootNode = node.getRootNode();
    const lumpNode = getParentLumpNode(node, rootNode);
    let parentOfLumpNode = lumpNode.parentNode;
    let offset = Array.from(parentOfLumpNode.childNodes).indexOf(lumpNode);
    lumpNode.remove();
    editor.updateRichNode();
    editor.setCarret(parentOfLumpNode, offset);
  }

  /**
   * Allows the plugin to notify the backspace handler a change has occured.
   * Returns true explicitly when it detects the manipulation.node is in LumpNode.
   *  This is the case when flag for removal has been set.
   * Other cases, we rely on the detectVisualChange from backspace handler
   * @method detectChange
   */
  detectChange( manipulation: Manipulation ) : boolean {
    const node = manipulation.node;
    const rootNode = node.getRootNode();

    if(!node.isConnected){
      return false;
    }

    const isElementInLumpNode = isInLumpNode(node, rootNode);
    const isManipulationSupported = this.isSupportedManipulation(manipulation);

    if(isElementInLumpNode && isManipulationSupported){
      return true;
    }

    return false;
  }

  /**
   * checks whether manipulation is supported
   * @method isSupportedManipulation
   */
  isSupportedManipulation( manipulation: Manipulation ) : boolean {
    return SUPPORTED_MANIPULATIONS.some( m => m === manipulation.type );
  }

  /**
   * checks whether element is flagged for removal
   * @method isElementFlaggedForRemoval
   */
  isElementFlaggedForRemoval( element: Element ) : boolean {
    return element.getAttribute('data-flagged-remove') === "complete";
  }

  /**
   * Flags the LumpNode for removal.
   * @method flagForRemoval
   */
  flagForRemoval( manipulation: Manipulation, _editor: Editor) : void {
    const node = manipulation.node;
    const rootNode = node.getRootNode();
    const lumpNode = getParentLumpNode(node, rootNode) as Element;
    lumpNode.setAttribute('data-flagged-remove', 'complete');
  }

}
