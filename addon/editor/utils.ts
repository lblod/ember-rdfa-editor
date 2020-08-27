import { invisibleSpace, isAllWhitespace, isDisplayedAsBlock, tagName } from '@lblod/ember-rdfa-editor/utils/ce/dom-helpers';
import { runInDebug } from '@ember/debug';

/**
 * Awaits until just *after* the next animation frame.
 *
 * requestAnimationFrame will run just before the paint cycle.
 * Executing a timeout in there will thus make us land in the next
 * animation cycle.  Just what we need for the cursor to be repainted.
 *
 * @return {Promise} A promise which resolves when the paint cycle has
 * occurred.
 */
export function paintCycleHappened() : Promise<void> {
  return new Promise( (cb) => {
    requestAnimationFrame( () =>
      setTimeout(() => {
        cb();
      }, 0 ) );
  } );
}

/**
 * set the carret on the desired position. This function uses the browsers selection api and does not update editor state!
 * when possible places cursor at the end of the textNode before the actual cursor position. This makes it easier to determine coordinates later on.
 * @method moveCaret
 * @param {DOMNode} node, a text node or dom element
 * @param {number} offset, for a text node the relative offset within the text node (i.e. number of characters before the carret).
 *                         for a dom element the number of childnodes before the carret.
 * Examples:
 *     to set the carret after 'c' in a textnode with text content 'abcd' use setCarret(textNode,3)
 *     to set the carret after the end of a node with innerHTML `<b>foo</b><span>work</span>` use setCarret(element, 2) (e.g setCarret(element, element.children.length))
 *     to set the carret after the b in a node with innerHTML `<b>foo</b><span>work</span>` use setCarret(element, 1) (e.g setCarret(element, indexOfChild + 1))
 *     to set the carret after the start of a node with innerHTML `<b>foo</b><span>work</span>` use setCarret(element, 0)
 * NOTE: This is similar, but not exactly the same as what setCaret does. Main differences:
 *           - setCaret will  also consider the textNode after the provided position, which we explicitly don't do here
 *           - setCaret updates editor state (notably rawEditor.currentSelection), which also causes movementObservers to run
 */
export function moveCaret(node: Node, position: number): null | Selection {
  let currentSelection = window.getSelection();
  if (currentSelection) {
    if (node.nodeType == Node.TEXT_NODE) {
      currentSelection.collapse(node,position)
    }
    else if (node.nodeType == Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (position > 0 && element.childNodes[position-1].nodeType == Node.TEXT_NODE) {
        // cheat a bit and move cursor inside the previous text node if possible
        const textNodeBeforeCursor = element.childNodes[position-1] as Text;
        currentSelection.collapse(textNodeBeforeCursor, textNodeBeforeCursor.length);
      }
      else {
        currentSelection.collapse(node,position);
      }
    }
    else {
      currentSelection.collapse(node,position);
    }
    return currentSelection;
  }
  else {
    throw "window.getSelection did not return a selection";
  }
}

/**
 * move the carret before the provided element, element needs to have a parentElement
 * @method moveCaretBefore
 * @param {ChildNode} child
 */
export function moveCaretBefore(child: ChildNode) : null | Selection {
  const parentElement = child.parentElement;
  if (parentElement) {
    const indexOfChild = Array.from(parentElement.childNodes).indexOf(child);
    return moveCaret(parentElement, indexOfChild);
  }
  else {
    console.warn('trying to move cursor before a child that is no longer connected to the dom tree');
    return null;
  }
}

/**
 * determines if an element has visible children
 *
 * this is a heuristic which is going to change over time
 *
 * Currently we assume
 * 1. that all textnodes with visibleText (as definied in stringToVisibleText) are visible
 * 2. that elements are visible if their clientWidth is larger than zero or their visible textContent > 0.
 *
 * // TODO: shoud we allow plugins to hook into this? that's probably required to this in a smart way?
 *
 * @method hasVisibleChildren
 * @param {Element} element
 * @return boolean
 */
export function hasVisibleChildren(parent: Element) : boolean {
    if (parent.childNodes.length === 0) {
      // no need to check empty elements from check
      return false;
    }

    let hasVisibleChildren = false;
    for (let child of Array.from(parent.childNodes)) {
      if (child.nodeType == Node.TEXT_NODE) {
        const textNode = child as Text;
        if (textNode.textContent && stringToVisibleText(textNode.textContent).length > 0  ) {
          hasVisibleChildren = true;
        }
      }
      else if (child.nodeType == Node.ELEMENT_NODE ) {
        const element = child as HTMLElement;
        if (element.nextSibling && tagName(element) == 'br') {
          // it's a br, but not the last br which we can ignore (most of the time...)
          hasVisibleChildren = true;
        }
        else if (element.innerText.length > 0) {
          // it has visible text content so it is visible
          hasVisibleChildren = true;
        }
        else if (element.clientWidth > 0) {
          // it has visible width so it is visible
          hasVisibleChildren = true;
        }
        else {
          editorDebug('assuming this node is not visible', child);
        }
      }
      else {
        // we assume other nodes can be ignored for now
        editorDebug('ignoring node, assuming non visible', child);
      }
    }
    return hasVisibleChildren;
  }

/**
 * Removes all whitespace, with the exception of non breaking spaces
 *
 * The \s match matches a bunch of content, as per
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes
 * and we do not want to match all of them.  Currently 160 (&nbsp;
 * A0) is removed from this list.
 *
 * TODO: this function clearly needs to take the CSS styling into
 * account.  One can only know positions based on the styling of the
 * document.  Finding visual positions to jump to thus need to take
 * this into account.
 *
 * @method stringToVisibleText
 * @public
 */
export function stringToVisibleText(string : string) : string {
  // \s as per JS [ \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff].
  return string
    .replace(new RegExp(`[${invisibleSpace}]+`,'g'),'')
    .replace(/[ \f\n\r\t\v\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,'');
}

/**
 * This method makes sure there is a valid textNode for caret.
 * If the rendered line solely consists out of whitespace text node(s), the carret won't behave as expected.
 * Especially in Firefox.
 * If the latter is the case, the provided textNode's content is replaced with an invisble whitespace.
 *
 * Notes
 * -----
 * Got inspiration from https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace
 * But needed to come up with own cases.
 *
 * @method ensureValidTextNodeForCaret
 * @public
 *
*/
export function ensureValidTextNodeForCaret(textNode : Text): Text {
  const parentElement = textNode.parentElement;
  const nextSibling = textNode.nextElementSibling;
  const previousSibling = textNode.previousElementSibling;
  //To be sure, we check for the whole neighbourhood of textNodes.
  const siblingsTextNodeNeighborhood = growAdjacentTextNodeNeighborhood(textNode);

  if(isWhiteSpaceTextNodesArray(siblingsTextNodeNeighborhood)){

    if (previousSibling && isDisplayedAsBlock(previousSibling)){
      //TODO: In theory the region could be merged.
      // But somewhere it feels better to minify the DOM operations. TBD
       textNode.textContent = invisibleSpace;
     }
     else if(nextSibling && isDisplayedAsBlock(nextSibling)){
       textNode.textContent = invisibleSpace;
     }
     else if(parentElement && isDisplayedAsBlock(parentElement)){
       textNode.textContent = invisibleSpace;
     }
  }
  return textNode;
}

/**
 * Starting from a textNode, get the neighorhood of adjacent TextNodes
 * @method ensureValidTextNodeForCaret
 * @public
 */
export function growAdjacentTextNodeNeighborhood(textNode: Text) : Array<Text> {
  let region = new Array<Text>();
  let currentNode = textNode;

  while(currentNode.previousSibling && currentNode.previousSibling.nodeType === Node.TEXT_NODE){
    region.push(currentNode.previousSibling as Text);
    currentNode = currentNode.previousSibling as Text;
  }

  region = [ ...region, textNode];

  currentNode = textNode;

  while(currentNode.nextSibling && currentNode.nextSibling.nodeType === Node.TEXT_NODE){
    region.push(currentNode.nextSibling as Text);
    currentNode = currentNode.nextSibling as Text;
  }

  return region;
}

/**
 * @method isWhiteSpaceTextNodesArray
 * @public
 */
export function isWhiteSpaceTextNodesArray(textNodes: Array<Text>) : boolean {
  return ! textNodes.some(textNode => ! isAllWhitespace(textNode) )
}

/**
 * utility function for backspace debug messages, allows messages to easily be disabled
 */
export function editorDebug(message : String, ...args : any) : void {
  runInDebug( () => console.debug(`BACKSPACE: ${message}`, ...args)); // eslint-disable-line no-console
}
