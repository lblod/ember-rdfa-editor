import { warn /*, debug, deprecate*/ } from '@ember/debug';
import { isVoidElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { Manipulation, ManipulationExecutor, ManipulationGuidance, VoidElement } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { InputHandler, HandlerResponse } from './input-handler';
import { RawEditor } from '../raw-editor';
import { paintCycleHappened,
         editorDebug,
         stringToVisibleText,
         hasVisibleChildren,
         moveCaret,
         moveCaretBefore,
         moveCaretAfter } from '@lblod/ember-rdfa-editor/editor/utils';

/**
 * Helper to compare 2 Arrays of DOMRect and to see wether any changes between them could be considered as a visual chancge.
 * TODO: this needs some refurbishing, now unclean absctraction.
 * @method checkVisibleChange
 * @private
 */
function checkVisibleChange( currentVisualCursorCoordinates: Array<DOMRect>,
                      previousVisualCursorCoordinates: Array<DOMRect> ) : boolean {

    if( ! previousVisualCursorCoordinates.length && ! currentVisualCursorCoordinates.length ){
      editorDebug(`delete-handler.checkVisibleChange`,
                  `Did not see a visual change when removing character, no visualCoordinates whatsoever`,
                  { new: currentVisualCursorCoordinates, old: previousVisualCursorCoordinates });
      return false;
    }
    else if( ! previousVisualCursorCoordinates.length && currentVisualCursorCoordinates.length ){
      editorDebug(`delete-handler.checkVisibleChange`, `no previous coordinates`);
      return true;
    }
    else if( previousVisualCursorCoordinates.length && ! currentVisualCursorCoordinates.length ){
      editorDebug(`delete-handler.checkVisibleChange`,'no new coordinates');
      return true;
    }
    //Previous and current have visual coordinates, we need to compare the contents
    else {
      const { left: ol, top: ot } = previousVisualCursorCoordinates[0];


      const { left: nl, top: nt } = currentVisualCursorCoordinates[0];

      const visibleChange = ol !== nl || ot !== nt;

      if( !visibleChange ){
        editorDebug(`delete-handler.checkVisibleChange`,
                    `Did not see a visual change when removing character`,
                    { new: currentVisualCursorCoordinates, old: previousVisualCursorCoordinates });
      }
      return visibleChange;
    }
  }

/**
 * Helper function: Given a reference DOMRect and a target,
 * re-map the coordinates compared to the reference
 * @method getRelativeDomRectCoordinates
 * @private
 *
 */
function getRelativeDomRectCoordinates(reference: DOMRect, target: DOMRect) : DOMRect {
    const normalizedRect = new DOMRect(
      target.x - reference.x,
      target.y - reference.y,
      target.width,
      target.height
    )
  return normalizedRect;
}

/**
 * We introduce an abstract reference point to check for visual changes.
 * In this handler, in some cases, we want the caret to stay, but content to be removed.
 * And sometimes we want the caret to move.  Hence, checking for change might imply different logic.
 * Note: this is a first shot at abstraction, might change over time.
 */
interface VisualChangeReferencePoint {
  storeMeasurePoint(): void;
  hasChangedVisibly: boolean;
  editor: RawEditor;
  cleanUp(): void;
}

class MagicSpan implements VisualChangeReferencePoint {
  // Note: We explicitly use coordinates in editor-space and not in viewPort-space.
  // because in longer documents, when removing content, document may move up on re-render and
  // as a result, the viewport coordinates might remain the same.
  firstMeasurePoint: Array<DOMRect>;
  secondMeasurePoint: Array<DOMRect>;
  span: Element;
  editor: RawEditor;

  constructor(span: Element, editor: RawEditor){
    this.span = span;
    this.editor = editor;
    this.firstMeasurePoint = [];
    this.secondMeasurePoint = [];
  }

  storeMeasurePoint() : void {
    const referenceFrame = this.editor.rootNode.getBoundingClientRect();
    const targets = Array.from(this.span.getClientRects());
    if(!this.firstMeasurePoint.length){
      this.firstMeasurePoint = targets.map(target => getRelativeDomRectCoordinates(referenceFrame as DOMRect, target as DOMRect));
    }
    else {
      this.secondMeasurePoint = targets.map(target => getRelativeDomRectCoordinates(referenceFrame as DOMRect, target as DOMRect));
    }
  }

  get hasChangedVisibly () : boolean {
    return checkVisibleChange(this.firstMeasurePoint, this.secondMeasurePoint)
  }

  cleanUp() : void {
    this.span.remove();
    this.editor.updateRichNode();
  }

}

class Caret implements VisualChangeReferencePoint {
  firstMeasurePoint: Array<DOMRect>;
  secondMeasurePoint: Array<DOMRect>;
  editor: RawEditor;

  constructor(editor: RawEditor){
    this.editor = editor;
    this.firstMeasurePoint = [];
    this.secondMeasurePoint = [];
  }

  private calculateSelectionRects(): Array<DOMRect> {
    if (window.getSelection() != null) {
      const selection = window.getSelection() as Selection
      if (selection.rangeCount > 0) {
        const referenceFrame = this.editor.rootNode.getBoundingClientRect();
        const targets = Array.from(selection.getRangeAt(0).getClientRects());
        return targets.map(target => getRelativeDomRectCoordinates(referenceFrame as DOMRect, target as DOMRect));
      }
    }
    return [];
  }

  storeMeasurePoint() : void {
    if(!this.firstMeasurePoint.length){
      this.firstMeasurePoint = this.calculateSelectionRects();
    }
    else {
      this.secondMeasurePoint = this.calculateSelectionRects();
    }
  }

  get hasChangedVisibly () : boolean {
    return checkVisibleChange(this.firstMeasurePoint, this.secondMeasurePoint)
  }

  cleanUp() : void {} //nothing to do
}

class VisibleTextLength implements VisualChangeReferencePoint {
  firstMeasurePoint: String;
  secondMeasurePoint: String;
  textNode: Text;
  editor: RawEditor;

  constructor(textNode: Text, editor: RawEditor){
    this.editor = editor;
    this.firstMeasurePoint = '';
    this.secondMeasurePoint = '';
    this.textNode = textNode;
  }

  private getVisibleText() : String {
    if(this.textNode.parentElement){
      return (this.textNode.parentElement as HTMLElement).innerText;
    }
    return '';
  }

  storeMeasurePoint() : void {
    if(!this.firstMeasurePoint.length){
      this.firstMeasurePoint = this.getVisibleText();
    }
    else {
      this.secondMeasurePoint = this.getVisibleText();
    }
  }

  get hasChangedVisibly () : boolean {
    return stringToVisibleText(this.firstMeasurePoint as string) !== stringToVisibleText(this.secondMeasurePoint as string)
  }

  cleanUp() : void {} //nothing to do
}

/**
 * A specific location in the document.
 *
 * If type is a character, the position indicates the character before
 * the supplied index.  In the string `hello`, the first l would be index
 * 2.
 */
type ThingAfterCursor =
  CharacterPosition
  | EmptyTextNodeStartPosition
  | EmptyTextNodeEndPosition
  | ElementStartPosition
  | VoidElementPosition
  | ElementEndPosition
  | UncommonNodeStartPosition
  | EditorRootEndPosition

interface BaseThingAfterCursor {
  type: string;
}

/**
 * There is a character after the cursor.
 *
 * We consider the current position of the cursor to be either inside
 * the provided node or in an adjacent text node.
 *
 * ```<TextNode> fo|o</TextNode>```  or
 * ```<TextNode>bar|</TextNode><TextNode>foo</TextNode>```
 */
interface CharacterPosition extends BaseThingAfterCursor {
  type: "character";
  node: Text;
  position: any;
}

/**
 * The end of a text node is fter the cursor, the text node is empty.
 *
 * ```<EmptyTextNode> |</EmptyTextNode>```
 *
 * Note: We assume an empty text node may take up space.
 */
interface EmptyTextNodeEndPosition extends BaseThingAfterCursor {
  type: "emptyTextNodeEnd";
  node: Text;
}

/**
 * A Text node after the cursor, the text node is empty
 * We consider the current position of the cursor at the beginning of the empty text node.
 *
 * ```|<EmptyTextNode></EmptyTextNode>```
 *
 */
interface EmptyTextNodeStartPosition extends BaseThingAfterCursor {
  type: "emptyTextNodeStart";
  node: Text;
}

/**
 * An element after the cursor and the cursor is currently outside the element.
 *
 *  ```|<Element>foo</Element>```
 *
 */
interface ElementStartPosition extends BaseThingAfterCursor {
  type: "elementStart";
  node: Element;
}

/**
 * An element after the cursor (cursor currently inside the element).
 *
 * ```<Element>foo|</Element>```
 *
 */
interface ElementEndPosition extends BaseThingAfterCursor {
  type: "elementEnd";
  node: HTMLElement;
}

/**
 * A void element after the cursor
 *
 * ```|<VoidElement/>```
 *
 */
interface VoidElementPosition extends BaseThingAfterCursor {
  type: "voidElement"
  node: VoidElement
}

/**
 * A node that is not of type Text or Element after the cursor.
 *
 * We consider the current cursor position to be right before the node.
 * see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 * for all possible types.
 *
 * TODO: do we want to split this up further? In theory the only other
 * expected types are Comment and (possibly) CDATASection
 *
 *  ```|<UncommonNode/>```
 *
 */
interface UncommonNodeStartPosition extends BaseThingAfterCursor {
  type: "uncommonNodeStart";
  node: UncommonNode
}

/**
 * These are nodes which, to our understanding, normally don't add
 * value to a text document.  As such, we consider them "Uncommon" by
 * lack of a better name.  We suspect to support some of these more in
 * depth as we get to understand how they appear in a text document in
 * the wild.
 */
type UncommonNode = CDATASection | ProcessingInstruction | Comment | Document | DocumentType | DocumentFragment;

/**
 * Ensures the received node is an UncommonNode.
 *
 * Throws an error if this is not the case.
 *
 * @param node [Node] The node to be returned.
 *
 * @param errorMessage [string] The error message to be printed in
 * case this is not an UncommonNode.
 */
function ensureUncommonNode( node: Node, errorMessage?: string ) : UncommonNode {
  if( [ Node.CDATA_SECTION_NODE,
        Node.PROCESSING_INSTRUCTION_NODE,
        Node.COMMENT_NODE,
        Node.DOCUMENT_NODE,
        Node.DOCUMENT_TYPE_NODE,
        Node.DOCUMENT_FRAGMENT_NODE ].includes( node.nodeType ) ) {
    return node as UncommonNode;
  } else {
    throw errorMessage || `Received node ${node} is not an UncommonNode.`;
  }
}

/**
 * The root element of the editor is right after the cursor.
 *
 * We consider the current cursor position to be at the very end
 * of the editor.
 */
interface EditorRootEndPosition extends BaseThingAfterCursor {
  type: "editorRootEnd";
  node: Element;
}

/**
 * Interface for specific plugins.
 */
export interface DeletePlugin {
  /**
   * One-liner explaining what the plugin solves.
   */
  label: string;

  /**
   * Callback executed to see if the plugin allows a certain
   * manipulation and/or if it intends to handle the manipulation
   * itself.
   */
  guidanceForManipulation: (manipulation: Manipulation) => ManipulationGuidance | null;

  /**
   * Callback to let the plugin indicate whether or not it discovered
   * a change.
   *
   * Hint: return false if you don't detect location updates.
   */
  detectChange: (manipulation: Manipulation) => boolean;
}

/**
 * Delete Handler, an event handler to handle removing content
 * after the cursor.
 * There is an extensive description in the backspace handler, about
 * its inner workings.
 *
 * @module contenteditable-editor
 * @class DeleteHandler
 * @constructor
 * @extends EmberObject
 */
export default class DeleteHandler implements InputHandler {

  /**
   * The editor instance on which we can execute changes.
   *
   * @property rawEditor
   * @type RawEditor
   * @default null
   */
  rawEditor: RawEditor

  /**
   * Array containing all plugins for the delete handler.
   */
  plugins: Array<DeletePlugin> = [];

  /////////////////////
  // CALLBACK INTERFACE
  /////////////////////

  /**
   * Constructs a deleteHandler instance
   *
   * @param {RawEditor} options.rawEditor Instance which will be used
   * to inspect and update the DOM tree.
   * @public
   * @constructor
   */
  constructor({ rawEditor }: { rawEditor: RawEditor }){
    this.rawEditor = rawEditor;
    // Order is now the sole parameter for conflict resolution of plugins. Think before changing.
    this.plugins = [
    ];
  }

  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {KeyboardEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event: Event ) {
    const selection = window.getSelection();
    return (
      (event.type === "keydown" && (event as KeyboardEvent).key === 'Delete')
     // || (event.type == "beforeinput" && (event as InputEvent).inputType == "deleteContentsBackwards") //TODO:figure out
     )
      && selection != null && selection.isCollapsed;
  }

  /**
   * handle delete event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent(event : Event) : HandlerResponse {
    // TODO: reason more about async behaviour of delete.
    event.preventDefault(); // make sure event propagation is stopped, async behaviour of delete could cause the browser to execute eventDefault before it is finished
    this.deleteForward().then( () => {
      this.rawEditor.updateSelectionAfterComplexInput(); // make sure currentSelection of editor is up to date with actual cursor position
    });
    return { allowPropagation: false };
  }

  /////////////////
  // IMPLEMENTATION
  /////////////////

  /**
   * General control-flow for the delete-handling.
   *
   * @method deleteForward //TODO rename
   * @private
   */
  async deleteForward( max_tries = 50 ) {
    if( max_tries == 0 ) {
      warn("Too many delete tries, giving up removing content", { id: "delete-handler-too-many-tries"});
      return;
    }

    // search for a manipulation to execute
    const manipulation = this.getNextManipulation();

    // check if we can execute it
    //TODO: no plugins yet + there is still some communication required between plugin and handler so handler can place
    // the visual reference point. This will be taken care of when starting implementing plugins.
    // (probably will contain a location and eventually som textContent)
    const { mayExecute, dispatchedExecutor } = this.checkManipulationByPlugins( manipulation );

    //Add reference point, we can mesure if something changed visually.
    const visualReference = this.ensureVisualChangeReferencePoint(manipulation);
    visualReference.storeMeasurePoint();

    //Declare for later use
    let pluginSeesChange;

    try {
      // error if we're not allowed to
      if ( ! mayExecute ) {
        warn( "Not allowed to execute manipulation for delete", { id: "delete-handler-manipulation-not-allowed" } );
        return;
      }

      // run the manipulation
      if( dispatchedExecutor ) {
        // NOTE: we should pass some sort of editor interface here in the future.
        dispatchedExecutor( manipulation, this.rawEditor );
      } else {
        this.handleNativeManipulation( manipulation );
      }

      editorDebug(`delete-handler.deleteForward`, `------------------Manipulation ${manipulation.type}`);

      // ask plugins if something has changed
      await paintCycleHappened();
      pluginSeesChange = this.runChangeDetectionByPlugins( manipulation );

      visualReference.storeMeasurePoint();
    }

    finally {

      //make sure the DOM-tree remains clean
      visualReference.cleanUp();

    }

    // maybe iterate again
    if( pluginSeesChange || visualReference.hasChangedVisibly ) {
      // TODO: do we need to make sure cursor state in the editor corresponds with browser state here?
      return;
    } else {
      // debugger;
      await this.deleteForward( max_tries - 1 );
    }
  }

  ensureVisualChangeReferencePoint(manipulation: Manipulation) : VisualChangeReferencePoint {
    let visualReferencePoint;
    const node = manipulation.node as ChildNode;
    switch( manipulation.type ) {
      case "removeCharacter":
        visualReferencePoint = new VisibleTextLength(node as Text, this.rawEditor)
        break;
      case "removeEmptyTextNode":
        visualReferencePoint = new MagicSpan(document.createElement('span'), this.rawEditor);
        node.after(visualReferencePoint.span);
        break;
      case "removeEmptyElement":
        visualReferencePoint = new MagicSpan(document.createElement('span'), this.rawEditor);
        node.after(visualReferencePoint.span);
        break;
      case "removeOtherNode":
        visualReferencePoint = new MagicSpan(document.createElement('span'), this.rawEditor);
        node.after(visualReferencePoint.span);
        break;
      case "removeVoidElement":
        visualReferencePoint = new MagicSpan(document.createElement('span'), this.rawEditor);
        node.after(visualReferencePoint.span);
        break;
      case "removeElementWithChildrenThatArentVisible":
        visualReferencePoint = new MagicSpan(document.createElement('span'), this.rawEditor);
        node.after(visualReferencePoint.span);
        break;
      case "moveCursorAfterElement":
        visualReferencePoint = new Caret(this.rawEditor);
        break;
      case "moveCursorToStartOfElement":
        visualReferencePoint = new Caret(this.rawEditor);
        break;
      case "keepCursorAtEnd":
        visualReferencePoint = new Caret(this.rawEditor);
        break;
      default:
        throw 'Unkown manipulation for insertVisualChangeReferencePoint';
    }

    return visualReferencePoint as VisualChangeReferencePoint;
  }

  /**
   * Returns truethy if a visual change could be detected.
   *
   * TODO: current implementation assumes selection is a carret.
   *
   * @method checkVisibleChange
   * @private
   *
   * @param options.previousVisualCursorCoordinates {Array<DOMRectCoordinatesInEditor>}
   * Coordinates of the rectangles defining the selection.
   */


  /**
   * Executes a single manipulation on the DOM tree, ensuring the
   * RichNodes and cursor are on the right spot after executing the
   * manipulation.
   *
   * @method handleNativeManipulation
   * @private
   *
   * @param {Manipulation} manipulation The manipulation which will be
   * executed on the DOM tree.
   */
  handleNativeManipulation( manipulation: Manipulation ) {
    switch( manipulation.type ) {
      case "removeCharacter":
        const { node, position } = manipulation;
        let nodeText = node.textContent || "";

        if (nodeText.length > position + 2 && nodeText.slice(position + 1 , position + 2 ) == " ") {
          // if the character after our current position is a space, it might become invisible, so we need to convert it to a non breaking space
          // cases where this happens:
          // - two spaces becoming neighbours after the delete
          // - spaces moving to the start of a node
          nodeText = `${nodeText.slice(0, position + 1)}\u00A0${nodeText.slice(position + 2)}`;
        }

        if (nodeText.length - 1 == position && nodeText.length > 1 && nodeText.slice(position - 1 , position) == " ") {
          // if the character before our new position is a space, it might become invisible, so we need to convert it to a non breaking space
          // cases where this happens:
          // - two spaces becoming neighbours after the delete
          // - spaces moving to the end of a node
          nodeText = `${nodeText.slice(0, position - 1)}\u00A0${nodeText.slice(position)}`;
        }

        node.textContent = `${nodeText.slice(0, position)}${nodeText.slice( position + 1)}`;
        this.rawEditor.updateRichNode();
        moveCaret(node, position); //we manipulated the node where the selection was, so needs an update
        break;

      case "removeEmptyTextNode":
        const { node: textNode } = manipulation;
        textNode.remove();
        this.rawEditor.updateRichNode();
        break;

      case "removeEmptyElement":
        const emptyElement = manipulation.node;
        emptyElement.remove();
        this.rawEditor.updateRichNode();
        break;

      case "removeOtherNode":
        const otherNode = manipulation.node as Node;
        //TODO: it is not very clear to me, why we use removeChild here instead of .remove().
        // taken from backspace-handler
        if (otherNode.parentElement) {
          // TODO: the following does not work without casting, and I'm
          // not sure we certainly have the childNode interface as per
          // https://developer.mozilla.org/en-US/docs/Web/API/ChildNode
          otherNode.parentElement.removeChild(otherNode);
          this.rawEditor.updateRichNode();
        }
        break;

      case "removeVoidElement":
        const voidElement = manipulation.node;
        voidElement.remove();
        this.rawEditor.updateRichNode();
        break;

      case "removeElementWithChildrenThatArentVisible":
        const elementWithOnlyInvisibleNodes = manipulation.node;
        elementWithOnlyInvisibleNodes.remove();
        this.rawEditor.updateRichNode();
        break;

      case "moveCursorAfterElement":
        moveCaretAfter(manipulation.node);
        break;

      case "moveCursorToStartOfElement":
        moveCaretBefore(manipulation.node.childNodes[0]); //Note: it has been checked it has children
        break;

      case "keepCursorAtEnd":
        // do nothing
        break;

      default:
        throw `Case ${manipulation.type} was not handled by handleNativeInputManipulation.`
    }
  }

  /**
   * Retrieves the next manipulation to execute.
   *
   * Tries to find the lower-most element right where the cursor is.
   * This will normally be a text node.  If that node contains any
   * potentially visible text, suggests to remove that text; if the
   * node contains no visible text whatsoever, suggests to remove the
   * node itself.
   *
   * @method getNextManipulation
   * @private
   */
  getNextManipulation() : Manipulation
  {
    // check where our cursor is and get the deepest "thing" after
    // the cursor (character or node)
    const thingAfterCursor: ThingAfterCursor = this.getThingAfterCursor();
    switch( thingAfterCursor.type ) {

      case "character":
        // character: remove the character
        const characterAfterCursor = thingAfterCursor as CharacterPosition;
        return {
          type: "removeCharacter",
          node: characterAfterCursor.node,
          position: characterAfterCursor.position
        };

      case "emptyTextNodeStart":
        // empty text node: remove the text node
        const textNodeAfterCursor = thingAfterCursor as EmptyTextNodeStartPosition;
        if( stringToVisibleText(textNodeAfterCursor.node.textContent || "").length === 0 ) {
          return {
            type: "removeEmptyTextNode",
            node: textNodeAfterCursor.node
          };
        } else {
          throw "Received text node which is not empty as previous node.  Some assumption broke.";
        }

      case "emptyTextNodeEnd":
        // empty text node: remove the text node
        const textNodePositionAfterCursor = thingAfterCursor as EmptyTextNodeEndPosition;
        if( stringToVisibleText(textNodePositionAfterCursor.node.textContent || "").length === 0 ) {
          return {
            type: "removeEmptyTextNode",
            node: textNodePositionAfterCursor.node
          };
        } else {
          throw "Received text node which is not empty as previous node.  Some assumption broke.";
        }

      case "voidElement":
        const voidElementAfterCursor = thingAfterCursor as VoidElementPosition;
        return {
          type: "removeVoidElement",
          node: voidElementAfterCursor.node
        };

      case "elementEnd":
        const elementAfterCursor = thingAfterCursor as ElementEndPosition;
        if(hasVisibleChildren(elementAfterCursor.node)){
          return {
            type: "moveCursorAfterElement",
            node: elementAfterCursor.node
          };
        }
        else {
          return {
            type: "removeEmptyElement",
            node: elementAfterCursor.node
          };
        }

      case "elementStart":
        const parentAfterCursor = thingAfterCursor as ElementStartPosition;
        const element = parentAfterCursor.node;
        if (hasVisibleChildren(element)){
          return {
            type: "moveCursorToStartOfElement",
            node: element as HTMLElement
          }
        }
        else {
          return {
            type: "removeEmptyElement",
            node: element
          };
        }

      case "uncommonNodeStart":
        const positionAfterCursor = thingAfterCursor as UncommonNodeStartPosition;
        const node = positionAfterCursor.node;
        return {
          type: "removeOtherNode",
          node: node
        };

      case "editorRootEnd":
        return {
          type: "keepCursorAtEnd",
          node: thingAfterCursor.node
        }

      default:
        throw `Could not find manipulation for ${thingAfterCursor.type}`
    }
  }

  /**
   * Retrieves the thing after the cursor position provided by the selection api.
   *
   * # What is the thing after a cursor position?
   *
   * The thing after a cursor could be one of many things.
   * Considering the following snippet:
   *
   *     ab[]cde<span>fg</span>hjk<b><i>lmn</i></b>op.
   *
   * Consider [] to be a blank text node.  The carret position is
   * described as being 'at' or before a character letter.
   *
   * ## Case a character
   *
   * The carret position is inside a textNode and there is a character before
   * the carret. NOTE: The carret can be behind the last letter of the textnode,
   * hence we can delete the last character
   *
   * described by CharacterPosition
   *
   * ## Case end of an empty textNode
   *
   * The carret is directly after an empty text node
   *
   * described by EmptyTextNodeEndPosition
   *
   * ## Case start of an empty textNode
   *
   * The carret is at the beginning of an empty text node
   *
   * described by EmptyTextNodeStartPosition
   *
   * ## Case a void element (br, hr, img, meta, ... elements that can't have childNodes)
   *
   * The carret is right after a void element
   *
   * described by VoidElementPosition
   *
   * ## Case an element directly before the carret
   *
   * The carret is directly after the element
   * Example: before o
   *
   * described by ElementEndPosition
   *
   * ## Case an element as parent of the cursor
   *
   * The carret is at the very beginning of the element
   * Example: before f
   *
   * described by ElementStartPosition
   *
   * ## Case a node that is neither element, nor textnode
   *
   * The carret is placed directly after the node
   * Example: <!-- other -->a , cursor is before a
   *
   * described by UncommonNodeEndPosition
   *
   * ## Case beginning of the editor
   *
   * The carret is placed at the very beginning of the editor, no other elements exist before the carret.
   *
   * described by EditorRootPosition
   *
   * @method getThingBeforeCursor
   * @public
   */
  getThingAfterCursor() : ThingAfterCursor
  {
    // TODO: should we support actual selections here as well or will that be a different handler?
    // current implementation assumes a collapsed selection (e.g. a carret)
    const windowSelection = window.getSelection();
    if (windowSelection && windowSelection.rangeCount > 0) {
      let range = windowSelection.getRangeAt(0);
      if (range.collapsed) {
        const node = range.startContainer;
        const position = range.startOffset;
        if (node.nodeType == Node.ELEMENT_NODE) {
          // the cursor is inside an element
          const element = node as Element;
          if (position == element.childNodes.length) {
            if (this.rawEditor.rootNode.isSameNode(element)) {
              // special case, we're at the end of the editor
              return { type: "editorRootEnd", node: element };
            }
            else {
              // at the end of the element
              return { type: "elementEnd", node: element as HTMLElement};
            }
          }
          else {
            // position is not the last so there is a child node after our cursor
            // position is the number of child nodes between the start of the startNode and our cursor.
            const child = element.childNodes[position] as ChildNode;
            if ( child && child.nodeType == Node.TEXT_NODE) {
              const textNode = child as Text;
              if(stringToVisibleText(textNode.textContent || "").length == 0){
                return { type: "emptyTextNodeStart", node: textNode};
              }
              else {
                return { type: "character", position: 0, node: textNode};
              }
            }
            else if( child && child.nodeType === Node.ELEMENT_NODE ){
              const element = child as HTMLElement;
              if (isVoidElement(element)) {
                return { type: "voidElement", node: element as VoidElement }
              }
              else {
                return { type: "elementStart", node: element as HTMLElement };
              }
            }
            else {
              const uncommonNode = ensureUncommonNode( child, "Assumed all node cases exhausted and uncommon node found in delete handler.  But node is not an uncommon node." );
              return { type: "uncommonNodeStart", node: uncommonNode };
            }
          }
        }
        else if (node.nodeType == Node.TEXT_NODE) {
          const textNode = node as Text;
          // cursor is in a text node
          if (stringToVisibleText(textNode.textContent || "").length == 0 && position < textNode.length){
            return { type: "emptyTextNodeEnd", node: textNode};
          }
          else if (position < textNode.length) {
            // can delete a character, the position remains the same
            return { type: "character", position: position, node: textNode};
          }
          else {
            // at the end of a non empty text node
            const nextSibling = textNode.nextSibling;
            if( nextSibling ) {
              if( nextSibling.nodeType === Node.TEXT_NODE ) {
                let sibling = nextSibling as Text;

                if (stringToVisibleText(sibling.textContent || "").length == 0){
                  return { type: "emptyTextNodeStart", node: sibling};
                }
                else {
                  return { type: "character", position: 0, node: sibling};
                }
              }
              else if( nextSibling.nodeType === Node.ELEMENT_NODE ){
                const sibling = nextSibling as HTMLElement;
                if (isVoidElement(sibling)) {
                  return { type: "voidElement", node: sibling as VoidElement }
                }
                else {
                  return { type: "elementStart", node: sibling };
                }
              }
              else {
                const uncommonNode = ensureUncommonNode( nextSibling, "Assumed all node cases exhausted and uncommon node found in delete handler.  But node is not an uncommon node." );
                return { type: "uncommonNodeStart", node: uncommonNode };
              }
            }
            else if (textNode.parentElement) {
              const parent = textNode.parentElement;
              if (parent != this.rawEditor.rootNode) {
                return { type: "elementEnd", node: parent };
              }
              else {
                return { type: "editorRootEnd", node: parent };
              }
            }
            else {
              throw "no next sibling or parentnode found"
            }
          }
        }
        else {
          console.warn(`did not expect a startcontainer of type ${node.nodeType} from range`); // eslint-disable-line-console
          // there should not be an else per spec
        }
      }
      throw "delete handler only understands collapsed ranges";
    }
    throw "no selection found";
  }

  /**
   * Checks whether all plugins agree the manipulation is allowed.
   *
   * This method asks each plugin individually if the manipulation is
   * allowed.  If it is not allowed by *any* plugin, it yields a
   * negative response, otherwise it yields a positive response.
   *
   * We expect this method to be extended in the future with more rich
   * responses from plugins.  Something like "skip" or "merge" to
   * indicate this manipulation should be lumped together with a
   * previous manipulation.  Plugins may also want to execute the
   * changes themselves to ensure correct behaviour.
   *
   * @method checkManipulationByPlugins
   * @private
   *
   * @param {Manipulation} manipulation DOM manipulation which will be
   * checked by plugins.
   **/
  checkManipulationByPlugins(manipulation: Manipulation) : { mayExecute: boolean, dispatchedExecutor: ManipulationExecutor | null } {

    // calculate reports submitted by each plugin
    const reports : Array<{ plugin: DeletePlugin, allow: boolean, executor: ManipulationExecutor | undefined }> = [];
    for ( const plugin of this.plugins ) {
      const guidance = plugin.guidanceForManipulation( manipulation );
      if( guidance ) {
        const allow = guidance.allow === undefined ? true : guidance.allow;
        const executor = guidance.executor;
        reports.push( { plugin, allow, executor } );
      }
    }

    // filter reports based on our interests
    const reportsNoExecute = reports.filter( ({ allow }) => !allow );
    const reportsWithExecutor = reports.filter( ({ executor }) => executor );

    // debug reporting
    if (reports.length > 1) {
      console.warn(`Multiple plugins want to alter this manipulation`, reports);
    }
    if (reportsNoExecute.length > 1 && reportsWithExecutor.length > 1) {
      console.error(`Some plugins don't want execution, others want custom execution`, { reportsNoExecute, reportsWithExecutor });
    }
    if (reportsWithExecutor.length > 1) {
      console.warn(`Multiple plugins want to execute this plugin. First entry in the list wins: ${reportsWithExecutor[0].plugin.label}`);
    }

    for( const { plugin } of reportsNoExecute ) {
      editorDebug(`delete-handler.checkManipulationByPlugins`,
                  `Was not allowed to execute delete manipulation by plugin ${plugin.label}`,
                  { manipulation, plugin });
    }

    // yield result
    return {
      mayExecute: reportsNoExecute.length === 0,
      dispatchedExecutor: reportsWithExecutor.length ? reportsWithExecutor[0].executor as ManipulationExecutor : null
    };
  }

  /**
   * Checks with each plugin if they have detected a change.
   *
   * @param {Manipulation} manipulation The change which was executed.
   * @return {boolean} True iff a plugin has detected a change.
   * @private
   * @method runChangeDetectionByPlugins
   */
  runChangeDetectionByPlugins( manipulation: Manipulation ): boolean {
    const reports =
      this
        .plugins
        .map( (plugin) => { return { plugin, detectedChange: plugin.detectChange( manipulation ) }; } )
        .filter( ({detectedChange}) => detectedChange );

    // debug reporting
    for( const { plugin } of reports ) {
      editorDebug(`delete-handler.runChangeDetectionByPlugins`, `Change detected by plugin ${plugin.label}`, { manipulation, plugin });
    }

    return reports.length > 0;
  }
}
