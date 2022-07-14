/**
 * List of all Void elements.
 *
 * This list is based on
 * https://www.w3.org/TR/html/syntax.html#void-elements, we removed
 * support for those elements which don't have any sane browser
 * support and for which no typing existed.
 *
 * The HTMLWbrElement type is a custom type which we have added
 * ourselves.  We did not find a type.
 */
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

export type VoidElement =
  | HTMLAreaElement
  | HTMLBaseElement
  | HTMLBRElement
  | HTMLTableColElement
  | HTMLEmbedElement
  | HTMLHRElement
  | HTMLImageElement
  | HTMLInputElement
  | HTMLLinkElement
  | HTMLMetaElement
  | HTMLParamElement
  | HTMLSourceElement
  | HTMLTrackElement
  | HTMLWbrElement;

/**
 * There is seemingly no type for this specified by the WHATWG.
 *
 * Should this change, this can be removed.
 */
interface HTMLWbrElement extends HTMLElement {
  tagName: 'wbr' | 'WBR';
}


/**
 * Base type for any manipulation, ensuring the type interface exists.
 */
export interface Manipulation {
  type: string;
}

/**
 * Represents the removal of an empty text node.
 */
export interface RemoveEmptyTextNodeManipulation extends Manipulation {
  type: 'removeEmptyTextNode';
  node: Text;
}

/**
 * Represents the removal of a single character from a text node.
 */
export interface RemoveCharacterManipulation extends Manipulation {
  type: 'removeCharacter';
  node: Text;
  position: number;
}

/**
 * Represents keeping the cursor at the start of the editor
 */
export interface KeepCursorAtStartManipulation extends Manipulation {
  type: 'keepCursorAtStart';
  node: Element;
}

/**
 * Represents keeping the cursor at the End of the editor
 */
export interface KeepCursorAtEndManipulation extends Manipulation {
  type: 'keepCursorAtEnd';
  node: Element;
}

/**
 * Represents the removal of an empty Element (so an Element without childNodes)
 */
export interface RemoveEmptyElementManipulation extends Manipulation {
  type: 'removeEmptyElement';
  node: Element;
}

/**
 * Represents the removal of a void element
 */
export interface RemoveVoidElementManipulation extends Manipulation {
  type: 'removeVoidElement';
  node: VoidElement;
}

/**
 * Represents moving the cursor after the last child of node
 */
export interface MoveCursorToEndOfElementManipulation extends Manipulation {
  type: 'moveCursorToEndOfElement';
  node: HTMLElement;
  selection?: Selection;
}

export interface MoveCursorToStartOfElementManipulation extends Manipulation {
  type: 'moveCursorToStartOfElement';
  node: HTMLElement;
  selection?: Selection;
}

/**
 * Represents moving the cursor before the element
 */
export interface MoveCursorBeforeElementManipulation extends Manipulation {
  type: 'moveCursorBeforeElement';
  node: HTMLElement;
  selection?: Selection;
}

export interface MoveCursorAfterElementManipulation extends Manipulation {
  type: 'moveCursorAfterElement';
  node: HTMLElement;
  selection?: Selection;
}

export interface MoveCursorAfterEditorManipulation extends Manipulation {
  type: 'moveCursorAfterEditor';
  node: HTMLElement; //will be rootNode of editor
}

export interface MoveCursorBeforeEditorManipulation extends Manipulation {
  type: 'moveCursorBeforeEditor';
  node: HTMLElement; //will be rootNode of editor
}

/**
 * Represents the removal of a node that is not of type Text of Element
 */
export interface RemoveOtherNodeManipulation extends Manipulation {
  type: 'removeOtherNode';
  node: Node;
}

/**
 * Represents the removal of an element that has only invisible text nodes as children
 * TODO: currently replaced by removeElementWithChildrenThatArentVisible
 */
export interface RemoveElementWithOnlyInvisibleTextNodeChildrenManipulation
  extends Manipulation {
  type: 'removeElementWithOnlyInvisibleTextNodeChildren';
  node: Element;
}

/**
 * Represents the removal of an element that only has invisible children
 */
export interface RemoveElementWithChildrenThatArentVisible
  extends Manipulation {
  type: 'removeElementWithChildrenThatArentVisible';
  node: Element;
}

/**
 * Represents adding text into a text node
 */
export interface InsertTextIntoTextNodeManipulation extends Manipulation {
  type: 'insertTextIntoTextNode';
  node: Text;
  position: number;
  text: string;
}

/**
 * Represents adding text into an element
 * position is the number of childNodes between the start of the element and the position where the text should be inserted
 */
export interface InsertTextIntoElementManipulation extends Manipulation {
  type: 'insertTextIntoElement';
  node: HTMLElement;
  position: number;
  text: string;
}

/**
 * Represents replacing a selection with text.
 */
export interface ReplaceSelectionWithTextManipulation extends Manipulation {
  type: 'replaceSelectionWithText';
  node: Node; // the anchorNode
  selection: Selection;
  text: string;
}

export interface RemoveBoundaryForwards extends Manipulation {
  type: 'removeBoundaryForwards';
  node: ChildNode;
}

export interface RemoveBoundaryBackwards extends Manipulation {
  type: 'removeBoundaryBackwards';
  node: Node;
}

export interface InsertTextIntoRange extends Manipulation {
  type: 'insertTextIntoRange';
  range: ModelRange;
  text: string;
}

