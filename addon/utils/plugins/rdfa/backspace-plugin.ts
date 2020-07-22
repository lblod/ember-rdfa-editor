import { BackspacePlugin,
         Editor,
         Manipulation,
         ManipulationGuidance
       } from '../../ce/handlers/backspace-handler';
import NodeWalker from '@lblod/marawa/node-walker';
import { isRdfaNode } from '../../rdfa/rdfa-rich-node-helpers';
import { invisibleSpace } from '../../ce/dom-helpers';

/**
 *
 * @class LumpNodeBackspacePlugin
 * @module plugin/lump-node
 */
export default class RdfaBackspacePlugin implements BackspacePlugin {
  label = 'backspace plugin for handling RDFA specific logic'

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    if(this.needsRemoveFlow(manipulation)){
      return {
        allow: true,
        executor: this.executeRemoveFlow
      }
    }
    else if(this.needsCompleteFlow(manipulation)){
      return {
        allow: true,
        executor: this.executeCompleteFlow
      }
    }
    else if(this.needsFlagAlmostComplete(manipulation)){
      return {
        allow: true,
        executor: this.flagAlmostComplete
      }
    }
    return null;
  }

  /**
   * TODO
   * @method detectChange
   */
  detectChange( manipulation: Manipulation ) : boolean {

    // if(manipulation.type === 'removeEmptyElement'
    //    || manipulation.type == 'removeElementWithOnlyInvisibleTextNodeChildren'
    //    || manipulation.type ==  'removeElementWithChildrenThatArentVisible'
    //   ){
    //   const node = manipulation.node as HTMLElement;
    //   if(this.hasFlagComplete(node)  && this.stringToVisibleText(node.innerText).length == 0){
    //     return true;
    //   }
    //   return false;
    // }
    const node = manipulation.node
    const parent = node.parentElement;
    if(parent && this.hasFlagComplete(parent)){
      return true;
    }
    // if((manipulation.type === 'removeCharacter' || manipulation.type === 'removeEmptyTextNode')
    //    && parent && this.hasFlagComplete(node)  && this.stringToVisibleText(parent.innerText).length == 0
    //   ){
    //   return true;
    // }
    //else return false;
    return false;
  }

  needsFlagAlmostComplete(manipulation: Manipulation) : boolean {
    const node = manipulation.node
    const parent = node.parentElement;

    if( (manipulation.type === 'removeCharacter' ||  manipulation.type === 'removeEmptyTextNode') && parent){
      return !this.hasFlagForRemoval(parent) && this.shouldHighlightElement(parent, this.stringToVisibleText(parent.innerText).length);
    }
    return false;
  // | RemoveEmptyTextNodeManipulation -> check length parent
  // | RemoveCharacterManipulation -> check lenght parent
  // | RemoveEmptyElementManipulation -> check RDFA and flag for final removal. In next iteration it will be removed
  // |  current implemantatino seems to immediatly go to 'complete'
  // | RemoveVoidElementManipulation -> ncheck RDFA and flag for final removal. In next iteration it will be removed
  // | RemoveOtherNodeManipulation -> nignore?
  // | RemoveElementWithOnlyInvisibleTextNodeChildrenManipulation -> similar to RemoveEmptyElementManipulation?
  // | RemoveElementWithChildrenThatArentVisible -> similar to RemoveEmptyElementManipulation?
    // | MoveCursorToEndOfNodeManipulation -> ignore?
    // | MoveCursorBeforeElementManipulation; -> ignore?
   //RemoveElementWithChildrenThatArentVisible
  }

  needsCompleteFlow(manipulation: Manipulation) : boolean {
    const node = manipulation.node
    const parent = node.parentElement;

    if( (manipulation.type === 'removeCharacter' || manipulation.type === 'removeEmptyTextNode') && parent){
      return this.hasFlagAlmostComplete(parent) && this.stringToVisibleText(parent.innerText).length == 1;
    }
    return false;
  }

  needsRemoveFlow(manipulation: Manipulation) : boolean {
    const node = manipulation.node
    const parent = node.parentElement;

    if( (manipulation.type === 'removeCharacter' || manipulation.type === 'removeEmptyTextNode') && parent){
      return this.hasFlagComplete(parent)
    }
    return false;
  }

  flagAlmostComplete(manipulation: Manipulation, _editor: Editor ) : void {
    const node = manipulation.node
    const parent = node.parentElement;

    if( (manipulation.type === 'removeCharacter' || manipulation.type === 'removeEmptyTextNode') && parent){
      parent.setAttribute('data-flagged-remove', 'almost-complete');
    }
  }

  executeCompleteFlow(manipulation: Manipulation, editor: Editor ) : void {
    const node = manipulation.node
    const parent = node.parentElement;

    if( (manipulation.type === 'removeCharacter' || manipulation.type === 'removeEmptyTextNode') && parent){
      parent.removeChild(node);
      parent.setAttribute('data-flagged-remove', 'complete');
      editor.updateRichNode();
      editor.setCarret(parent, 0);
    }

  }

  executeRemoveFlow(manipulation: Manipulation, editor: Editor ) : void {
    const node = manipulation.node
    const rdfaElement = node.parentElement;
    const parent = rdfaElement && rdfaElement.parentElement;

    if(!(parent && rdfaElement)){
      return;
    }

    if( (manipulation.type === 'removeCharacter' || manipulation.type === 'removeEmptyTextNode') && parent){
      let offset = Array.from(parent.childNodes).indexOf(rdfaElement);
      rdfaElement.remove();
      editor.updateRichNode();
      editor.setCarret(parent, offset);
    }
  }

  shouldHighlightElement(element: Element, visibleLength: number, tresholdTextLength = 5) : boolean {
    let nodeWalker = new NodeWalker();
    return visibleLength < tresholdTextLength && element.childNodes.length == 1 && isRdfaNode(nodeWalker.processDomNode(element));
  }

  hasFlagForRemoval(element: Element) : boolean {
    const attrValue = element.getAttribute('data-flagged-remove');
    return attrValue !== null && attrValue.length > 0;
  }

  hasFlagAlmostComplete(element: Element) : boolean {
    const attrValue = element.getAttribute('data-flagged-remove');
    return attrValue === 'almost-complete';
  }

  hasFlagComplete(element: Element) : boolean {
    const attrValue = element.getAttribute('data-flagged-remove');
    return attrValue === 'complete';
  }

  //TODO: move to util
  stringToVisibleText(string : string) : string {
    // \s as per JS [ \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff].
    return string
      .replace(invisibleSpace,'')
      .replace(/[ \f\n\r\t\v\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,'');
  }

}
