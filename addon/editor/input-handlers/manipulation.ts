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
export type VoidElement = HTMLAreaElement
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
  | HTMLWbrElement

/**
 * There is seemingly no type for this specified by the WHATWG.
 *
 * Should this change, this can be removed.
 */
interface HTMLWbrElement extends HTMLElement {
  tagName: "wbr" | "WBR"
}

/**
 * Contains a set of all currently supported manipulations.
 */
export type Manipulation =
  RemoveEmptyTextNodeManipulation
  | RemoveCharacterManipulation
  | RemoveEmptyElementManipulation
  | RemoveVoidElementManipulation
  | RemoveOtherNodeManipulation
  | RemoveElementWithOnlyInvisibleTextNodeChildrenManipulation
  | RemoveElementWithChildrenThatArentVisible
  | MoveCursorToEndOfNodeManipulation
  | MoveCursorAfterElementManipulation
  | MoveCursorBeforeElementManipulation
  | MoveCursorAfterEditorManipulation
  | MoveCursorBeforeEditorManipulation
  | MoveCursorInsideNonVoidAndVisibleElementAtStartManipulation
  | MoveCursorInsideNonVoidAndVisibleElementAtEndManipulation
  | KeepCursorAtStartManipulation
  | InsertTextIntoTextNodeManipulation
  | InsertTextIntoElementManipulation
  | ReplaceSelectionWithTextManipulation
;

/**
 * Executor of a single Manipulation, as offered by plugins.
 *
 * The plugin receives a Manipulation and an Editor, and can use both
 * to handle the manipulation.  Returning such manipulation is
 * optional.  A plugin need not handle a manipulation.
 */
export type ManipulationExecutor = (manipulation: Manipulation, editor: Editor) => void;

export interface Editor {
  setCarret: ( node: Node, position: number ) => void
  updateRichNode: () => void
}

/**
 * Base type for any manipulation, ensuring the type interface exists.
 */
export interface BaseManipulation {
  type: string;
  node?: Node;
}

/**
 * Represents the removal of an empty text node.
 */
export interface RemoveEmptyTextNodeManipulation extends BaseManipulation {
  type: "removeEmptyTextNode";
  node: Text;
}

/**
 * Represents the removal of a single character from a text node.
 */
export interface RemoveCharacterManipulation extends BaseManipulation {
  type: "removeCharacter";
  node: Text;
  position: number;
}

/**
 * Represents keeping the cursor at the start of the editor
 */
export interface KeepCursorAtStartManipulation extends BaseManipulation {
  type: "keepCursorAtStart";
  node: Element;
}


/**
 * Represents the removal of an empty Element (so an Element without childNodes)
 */
export interface RemoveEmptyElementManipulation extends BaseManipulation {
  type: "removeEmptyElement";
  node: Element;
}

/**
 * Represents the removal of a void element
 */
export interface RemoveVoidElementManipulation extends BaseManipulation {
  type: "removeVoidElement";
  node: VoidElement;
}

/**
 * Represents moving the cursor after the last child of node
 */
export interface MoveCursorToEndOfNodeManipulation extends BaseManipulation {
  type: "moveCursorToEndOfNode";
  node: Element;
}

/**
 * Represents moving the cursor before the element
 */
export interface MoveCursorBeforeElementManipulation extends BaseManipulation {
  type: "moveCursorBeforeElement";
  node: HTMLElement;
}

/**
 * Represents the removal of a node that is not of type Text of Element
 */
export interface RemoveOtherNodeManipulation extends BaseManipulation {
  type: "removeOtherNode";
  node: Node;
}

/**
 * Represents the removal of an element that has only invisible text nodes as children
 * TODO: currently replaced by removeElementWithChildrenThatArentVisible
 */
export interface RemoveElementWithOnlyInvisibleTextNodeChildrenManipulation extends BaseManipulation {
  type: "removeElementWithOnlyInvisibleTextNodeChildren";
  node: Element;
}

/**
 * Represents the removal of an element that only has invisible children
 */
export interface RemoveElementWithChildrenThatArentVisible extends BaseManipulation {
  type: "removeElementWithChildrenThatArentVisible";
  node: Element;
}

/**
 * Represents adding text into a text node
 */
export interface InsertTextIntoTextNodeManipulation extends BaseManipulation {
  type: "insertTextIntoTextNode";
  node: Text;
  position: number;
  text: string;
}

/**
 * Represents adding text into an element
 * position is the number of childNodes between the start of the element and the position where the text should be inserted
 */
export interface InsertTextIntoElementManipulation extends BaseManipulation {
  type: "insertTextIntoElement";
  node: HTMLElement;
  position: number;
  text: string;
}

/**
 * Represents replacing a selection with text
 */
export interface ReplaceSelectionWithTextManipulation extends BaseManipulation {
  type: "replaceSelectionWithText";
  node: Node; // the anchorNode
  selection: Selection
  text: string;
}

export interface MoveCursorAfterElementManipulation extends BaseManipulation {
  type: "moveCursorAfterElement";
  node: HTMLElement;
  selection: Selection;
}

export interface MoveCursorAfterEditorManipulation extends BaseManipulation {
  type: "moveCursorAfterEditor";
  node: HTMLElement; //will be rootNode of editor
}

export interface MoveCursorBeforeEditorManipulation extends BaseManipulation {
  type: "moveCursorBeforeEditor";
  node: HTMLElement; //will be rootNode of editor
}

export interface MoveCursorInsideNonVoidAndVisibleElementAtStartManipulation extends BaseManipulation {
  type: "moveCursorInsideNonVoidAndVisibleElementAtStart"; //TODO: prettier name
  node: HTMLElement;
  selection: Selection;
}

export interface MoveCursorInsideNonVoidAndVisibleElementAtEndManipulation extends BaseManipulation {
  type: "moveCursorInsideNonVoidAndVisibleElementAtEnd"; //TODO: prettier name
  node: HTMLElement;
  selection: Selection;
}

export interface ManipulationGuidance {
  allow: boolean | undefined
  executor: ManipulationExecutor | undefined
}
