import {warn} from '@ember/debug';
import {isVoidElement, removeNode} from '@lblod/ember-rdfa-editor/archive/utils/dom-helpers';
import {
  KeepCursorAtEndManipulation,
  Manipulation, ManipulationGuidance, RemoveBoundaryBackwards,
  RemoveBoundaryForwards,
  RemoveCharacterManipulation, RemoveElementWithChildrenThatArentVisible,
  RemoveEmptyElementManipulation,
  RemoveEmptyTextNodeManipulation, RemoveOtherNodeManipulation,
  RemoveVoidElementManipulation,
  VoidElement
} from '@lblod/ember-rdfa-editor/archive/editor/input-handlers/manipulation';
import {InputHandler, InputPlugin} from './input-handler';
import {
  editorDebug,
  hasVisibleChildren,
  moveCaret,
  moveCaretAfter,
  moveCaretBefore,
  paintCycleHappened,
  stringToVisibleText
} from '@lblod/ember-rdfa-editor/archive/editor/utils';
import ListDeletePlugin from '@lblod/ember-rdfa-editor/archive/utils/plugins/lists/delete-plugin';
import { HandlerResponse } from './handler-response';
import PernetRawEditor from "@lblod/ember-rdfa-editor/archive/utils/ce/pernet-raw-editor";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/util/event-helpers";

/**
 * We introduce an abstract reference point to check for visual changes.
 * In this handler, in some cases, we want the caret to stay, but content to be removed.
 * And sometimes we want the caret to move.  Hence, checking for change might imply different logic.
 * Note: this is a first shot at abstraction, might change over time.
 */
interface VisualChangeReferencePoint {
  storeMeasurePoint(): void;

  hasChangedVisually: boolean;
  editor: PernetRawEditor;

  cleanUp(): void;
}

export class MagicSpan implements VisualChangeReferencePoint {
  // Note: We explicitly use coordinates in editor-space and not in viewPort-space.
  // because in longer documents, when removing content, document may move up on re-render and
  // as a result, the viewport coordinates might remain the same.
  /**
   * This allows us to distinguish a magic span from a normal one
   */
  static ID = "__magic_span";
  firstMeasurePoint: Array<DOMRect>;
  secondMeasurePoint: Array<DOMRect>;
  span: Element;
  editor: PernetRawEditor;

  constructor(span: Element, editor: PernetRawEditor) {
    this.span = span;
    this.span.id = MagicSpan.ID;
    this.editor = editor;
    this.firstMeasurePoint = [];
    this.secondMeasurePoint = [];
  }

  storeMeasurePoint(): void {
    const referenceFrame = this.editor.rootNode.getBoundingClientRect();
    const targets = Array.from(this.span.getClientRects());
    if (!this.firstMeasurePoint.length) {
      this.firstMeasurePoint = targets.map(target => getRelativeDomRectCoordinates(referenceFrame, target));
    } else {
      this.secondMeasurePoint = targets.map(target => getRelativeDomRectCoordinates(referenceFrame, target));
    }
  }

  get hasChangedVisually(): boolean {
    return checkVisibleChange(this.firstMeasurePoint, this.secondMeasurePoint);
  }

  cleanUp(): void {
    this.span.remove();
    this.editor.updateRichNode();
  }
}

class Caret implements VisualChangeReferencePoint {
  firstMeasurePoint: Array<DOMRect>;
  secondMeasurePoint: Array<DOMRect>;
  editor: PernetRawEditor;

  constructor(editor: PernetRawEditor) {
    this.editor = editor;
    this.firstMeasurePoint = [];
    this.secondMeasurePoint = [];
  }

  private calculateSelectionRects(): Array<DOMRect> {
    if (window.getSelection() != null) {
      const selection = window.getSelection() as Selection;
      if (selection.rangeCount > 0) {
        const referenceFrame = this.editor.rootNode.getBoundingClientRect();
        const targets = Array.from(selection.getRangeAt(0).getClientRects());
        return targets.map(target => getRelativeDomRectCoordinates(referenceFrame, target));
      }
    }
    return [];
  }

  storeMeasurePoint(): void {
    if (!this.firstMeasurePoint.length) {
      this.firstMeasurePoint = this.calculateSelectionRects();
    } else {
      this.secondMeasurePoint = this.calculateSelectionRects();
    }
  }

  get hasChangedVisually(): boolean {
    return checkVisibleChange(this.firstMeasurePoint, this.secondMeasurePoint);
  }

  cleanUp(): void {
    // Nothing to do.
  }
}

class VisibleTextLength implements VisualChangeReferencePoint {
  firstMeasurePoint: string;
  secondMeasurePoint: string;
  textNode: Text;
  editor: PernetRawEditor;

  constructor(textNode: Text, editor: PernetRawEditor) {
    this.editor = editor;
    this.firstMeasurePoint = '';
    this.secondMeasurePoint = '';
    this.textNode = textNode;
  }

  private getVisibleText(): string {
    if (this.textNode.parentElement) {
      return (this.textNode.parentElement).innerText;
    }
    return '';
  }

  storeMeasurePoint(): void {
    if (!this.firstMeasurePoint.length) {
      this.firstMeasurePoint = this.getVisibleText();
    } else {
      this.secondMeasurePoint = this.getVisibleText();
    }
  }

  get hasChangedVisually(): boolean {
    return stringToVisibleText(this.firstMeasurePoint) !== stringToVisibleText(this.secondMeasurePoint);
  }

  cleanUp(): void {
    //nothing to do
  }
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
  | EditorRootEndPosition;

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
  position: number;
}

/**
 * The end of a text node is after the cursor, the text node is empty.
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
 * ```|<Element>foo</Element>```
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
 *TODO: do we want to split this up further? In theory the only other
 * expected types are Comment and (possibly) CDATASection.
 *
 * ```|<UncommonNode/>```
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
 * Throws an error if this is not the case.
 *
 * @param node [Node] The node to be returned.
 *
 * @param errorMessage [string] The error message to be printed in
 * case this is not an UncommonNode.
 */
function ensureUncommonNode(node: Node, errorMessage?: string): UncommonNode {
  if ([Node.CDATA_SECTION_NODE,
    Node.PROCESSING_INSTRUCTION_NODE,
    Node.COMMENT_NODE,
    Node.DOCUMENT_NODE,
    Node.DOCUMENT_TYPE_NODE,
    Node.DOCUMENT_FRAGMENT_NODE].includes(node.nodeType)) {
    return node as UncommonNode;
  } else {
    throw errorMessage || `Received node ${node.toString()} is not an UncommonNode.`;
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

export type DeleteHandlerManipulation =
  RemoveCharacterManipulation
  | RemoveEmptyTextNodeManipulation
  | RemoveVoidElementManipulation
  | RemoveBoundaryForwards
  | RemoveEmptyElementManipulation
  | RemoveBoundaryBackwards
  | RemoveOtherNodeManipulation
  | RemoveElementWithChildrenThatArentVisible
  | KeepCursorAtEndManipulation;

/**
 * Interface for specific plugins.
 */
export interface DeletePlugin extends InputPlugin {
  guidanceForManipulation: (manipulation: DeleteHandlerManipulation, editor: PernetRawEditor) => ManipulationGuidance | null;

  /**
   * Callback to let the plugin indicate whether or not it discovered
   * a change.
   *
   * Hint: return false if you don't detect location updates.
   */
  detectChange: (manipulation: DeleteHandlerManipulation) => boolean;
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
 * @extends InputHandler
 */
export default class DeleteHandler extends InputHandler {
  isLocked: boolean;

  /**
   * Array containing all plugins for the delete handler.
   */
  plugins: Array<DeletePlugin> = [];

  ////////////////////////
  // CALLBACK INTERFACE //
  ////////////////////////

  /**
   * Constructs a deleteHandler instance
   *
   * @param {RawEditor} rawEditor options.rawEditor Instance which will be used
   * to inspect and update the DOM tree.
   * @public
   * @constructor
   */
  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    super(rawEditor);
    // Order is now the sole parameter for conflict resolution of plugins. Think before changing.
    this.plugins = [
      new ListDeletePlugin()
    ];
    this.isLocked = false;
  }

  /**
   * Tests this handler can handle the specified event.
   * @method isHandlerFor
   * @param {Event} event
   * @return boolean
   * @public
   */
  isHandlerFor(event: Event): boolean {
    const selection = window.getSelection();

    //TODO: Figure out if this should handle the following:
    // event.type == "beforeinput" && (event as InputEvent).inputType == "deleteContentsBackwards"
    return isKeyDownEvent(event)
      && event.key === "Delete"
      && selection !== null
      && selection.isCollapsed;
  }

  /**
   * handle delete event
   * @method handleEvent
   * @public
   */
  handleEvent(event: Event): HandlerResponse {
    // TODO: reason more about async behaviour of delete.
    event.preventDefault(); // make sure event propagation is stopped, async behaviour of delete could cause the browser to execute eventDefault before it is finished

    //TODO: think harder about managability of the lock state, now a bit all over the place
    if (this.isLocked) {
      editorDebug(`delete-handler.handleEvent`, `Handler is busy deleting, skipping`);
      return {allowPropagation: false};
    }

    void this.deleteForward().then(() => {
      this.rawEditor.updateSelectionAfterComplexInput(); // make sure currentSelection of editor is up to date with actual cursor position
    });
    return {allowPropagation: false};
  }

  ////////////////////
  // IMPLEMENTATION //
  ////////////////////

  /**
   * General control-flow for the delete-handling.
   *
   * @method deleteForward //TODO rename
   * @private
   */
  async deleteForward(max_tries = 50) {

    if (this.isLocked) {
      editorDebug(`delete-handler.deleteForward`, `Handler is busy deleting, skipping`);
      return;
    }

    if (max_tries == 0) {
      warn("Too many delete tries, giving up removing content", {id: "delete-handler-too-many-tries"});
      return;
    }

    //Lock here
    this.isLocked = true;

    // search for a manipulation to execute
    const manipulation = this.getNextManipulation();
    editorDebug(`delete-handler.deleteForward`, `chose manipulation: `, manipulation);

    // check if we can execute it
    //TODO: no plugins yet + there is still some communication required between plugin and handler so handler can place
    // the visual reference point. This will be taken care of when starting implementing plugins.
    // (probably will contain a location and eventually som textContent)
    const {mayExecute, dispatchedExecutor} = this.checkManipulationByPlugins(manipulation);

    //Add reference point, we can mesure if something changed visually.
    const visualReference = this.ensureVisualChangeReferencePoint(manipulation);
    visualReference.storeMeasurePoint();

    //Declare for later use
    let pluginSeesChange;

    try {
      // error if we're not allowed to
      if (!mayExecute) {
        warn("Not allowed to execute manipulation for delete", {id: "delete-handler-manipulation-not-allowed"});
        return;
      }

      // run the manipulation
      if (dispatchedExecutor) {
        // NOTE: we should pass some sort of editor interface here in the future.
        dispatchedExecutor(manipulation, this.rawEditor);
      } else {
        this.handleNativeManipulation(manipulation);
      }

      editorDebug(`delete-handler.deleteForward`, `------------------Manipulation ${manipulation.type}`);

      // ask plugins if something has changed
      await paintCycleHappened();
      pluginSeesChange = this.runChangeDetectionByPlugins(manipulation);

      visualReference.storeMeasurePoint();
    } finally {

      //make sure the DOM-tree remains clean
      visualReference.cleanUp();

      //make sure always unlocked
      this.isLocked = false;
    }

    // maybe iterate again
    if (pluginSeesChange || visualReference.hasChangedVisually) {
      // TODO: do we need to make sure cursor state in the editor corresponds with browser state here?
      return;
    } else {
      // debugger;
      await this.deleteForward(max_tries - 1);
    }
  }

  ensureVisualChangeReferencePoint(manipulation: DeleteHandlerManipulation): VisualChangeReferencePoint {
    let visualReferencePoint;
    const node = manipulation.node as ChildNode;
    switch (manipulation.type) {
      case "removeCharacter":
        visualReferencePoint = new VisibleTextLength(node as Text, this.rawEditor);
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
      case "removeBoundaryForwards":
        visualReferencePoint = new Caret(this.rawEditor);
        break;
      case "removeBoundaryBackwards":
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
   * Returns truthy if a visual change could be detected.
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
  handleNativeManipulation(manipulation: DeleteHandlerManipulation) {
    switch (manipulation.type) {
      case "removeCharacter": {
        const {node, position} = manipulation;
        let nodeText = node.textContent || "";

        if (nodeText.length > position + 2 && nodeText.slice(position + 1, position + 2) == " ") {
          // if the character after our current position is a space, it might become invisible, so we need to convert it to a non breaking space
          // cases where this happens:
          // - two spaces becoming neighbours after the delete
          // - spaces moving to the start of a node
          nodeText = `${nodeText.slice(0, position + 1)}\u00A0${nodeText.slice(position + 2)}`;
        }

        if (nodeText.length - 1 == position && nodeText.length > 1 && nodeText.slice(position - 1, position) == " ") {
          // if the character before our new position is a space, it might become invisible, so we need to convert it to a non breaking space
          // cases where this happens:
          // - two spaces becoming neighbours after the delete
          // - spaces moving to the end of a node
          nodeText = `${nodeText.slice(0, position - 1)}\u00A0${nodeText.slice(position)}`;
        }

        node.textContent = `${nodeText.slice(0, position)}${nodeText.slice(position + 1)}`;
        this.rawEditor.updateRichNode();
        moveCaret(node, position); //we manipulated the node where the selection was, so needs an update
        break;
      }

      case "removeEmptyTextNode": {
        const {node: textNode} = manipulation;
        removeNode(textNode);
        this.rawEditor.updateRichNode();
        break;
      }

      case "removeEmptyElement": {
        const emptyElement = manipulation.node;
        emptyElement.remove();
        this.rawEditor.updateRichNode();
        break;
      }

      case "removeOtherNode": {
        const otherNode = manipulation.node;
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
      }

      case "removeVoidElement": {
        const voidElement = manipulation.node;
        voidElement.remove();
        this.rawEditor.updateRichNode();
        break;
      }

      case "removeElementWithChildrenThatArentVisible": {
        const elementWithOnlyInvisibleNodes = manipulation.node;
        elementWithOnlyInvisibleNodes.remove();
        this.rawEditor.updateRichNode();
        break;
      }

      case "removeBoundaryForwards": {
        // default implementation is almost always wrong, but harmless and it visually does something
        moveCaretAfter(manipulation.node);
        break;
      }

      case "removeBoundaryBackwards": {
        // default implementation is almost always wrong, but harmless and it visually does something
        moveCaretBefore(manipulation.node.childNodes[0]); //Note: it has been checked it has children
        break;
      }

      case "keepCursorAtEnd": {
        // do nothing
        break;
      }

      default:
        throw `Case ${(manipulation as Manipulation).type} was not handled by handleNativeInputManipulation.`;
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
  getNextManipulation(): DeleteHandlerManipulation {
    // check where our cursor is and get the deepest "thing" after
    // the cursor (character or node)
    const thingAfterCursor: ThingAfterCursor = this.getThingAfterCursor();
    switch (thingAfterCursor.type) {
      case "character": {
        // character: remove the character
        const characterAfterCursor = thingAfterCursor;
        return {
          type: "removeCharacter",
          node: characterAfterCursor.node,
          position: characterAfterCursor.position
        };

      }
      case "emptyTextNodeStart": {
        // empty text node: remove the text node
        const textNodeAfterCursor = thingAfterCursor;
        if (stringToVisibleText(textNodeAfterCursor.node.textContent || "").length === 0) {
          return {
            type: "removeEmptyTextNode",
            node: textNodeAfterCursor.node
          };
        } else {
          throw "Received text node which is not empty as previous node.  Some assumption broke.";
        }

      }
      case "emptyTextNodeEnd": {
        // empty text node: remove the text node
        const textNodePositionAfterCursor = thingAfterCursor;
        if (stringToVisibleText(textNodePositionAfterCursor.node.textContent || "").length === 0) {
          return {
            type: "removeEmptyTextNode",
            node: textNodePositionAfterCursor.node
          };
        } else {
          throw "Received text node which is not empty as previous node.  Some assumption broke.";
        }

      }
      case "voidElement": {
        const voidElementAfterCursor = thingAfterCursor;
        return {
          type: "removeVoidElement",
          node: voidElementAfterCursor.node
        };

      }
      case "elementEnd": {
        const elementAfterCursor = thingAfterCursor;
        if (hasVisibleChildren(elementAfterCursor.node)) {
          return {
            type: "removeBoundaryForwards",
            node: elementAfterCursor.node
          };
        } else {
          return {
            type: "removeEmptyElement",
            node: elementAfterCursor.node
          };
        }

      }
      case "elementStart": {
        const parentAfterCursor = thingAfterCursor;
        const element = parentAfterCursor.node;
        if (hasVisibleChildren(element)) {
          return {
            type: "removeBoundaryBackwards",
            node: element as HTMLElement
          };
        } else {
          return {
            type: "removeEmptyElement",
            node: element
          };
        }

      }
      case "uncommonNodeStart": {
        const positionAfterCursor = thingAfterCursor;
        const node = positionAfterCursor.node;
        return {
          type: "removeOtherNode",
          node: node
        };

      }
      case "editorRootEnd":
        return {
          type: "keepCursorAtEnd",
          node: thingAfterCursor.node
        };

      default:
        throw `Could not find manipulation for ${(thingAfterCursor as ThingAfterCursor).type}`;
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
  getThingAfterCursor(): ThingAfterCursor {
    // TODO: should we support actual selections here as well or will that be a different handler?
    // current implementation assumes a collapsed selection (e.g. a carret)
    const windowSelection = window.getSelection();
    if (windowSelection && windowSelection.rangeCount > 0) {
      const range = windowSelection.getRangeAt(0);
      if (range.collapsed) {
        const node = range.startContainer;
        const position = range.startOffset;
        if (node.nodeType == Node.ELEMENT_NODE) {
          // the cursor is inside an element
          const element = node as Element;
          if (position == element.childNodes.length) {
            if (this.rawEditor.rootNode.isSameNode(element)) {
              // special case, we're at the end of the editor
              return {type: "editorRootEnd", node: element};
            } else {
              // at the end of the element
              return {type: "elementEnd", node: element as HTMLElement};
            }
          } else {
            // position is not the last so there is a child node after our cursor
            // position is the number of child nodes between the start of the startNode and our cursor.
            const child = element.childNodes[position];
            if (child && child.nodeType == Node.TEXT_NODE) {
              const textNode = child as Text;
              if (stringToVisibleText(textNode.textContent || "").length == 0) {
                return {type: "emptyTextNodeStart", node: textNode};
              } else {
                return {type: "character", position: 0, node: textNode};
              }
            } else if (child && child.nodeType === Node.ELEMENT_NODE) {
              const element = child as HTMLElement;
              if (isVoidElement(element)) {
                return {type: "voidElement", node: element as VoidElement};
              } else {
                return {type: "elementStart", node: element};
              }
            } else {
              const uncommonNode = ensureUncommonNode(child, "Assumed all node cases exhausted and uncommon node found in delete handler.  But node is not an uncommon node.");
              return {type: "uncommonNodeStart", node: uncommonNode};
            }
          }
        } else if (node.nodeType == Node.TEXT_NODE) {
          const textNode = node as Text;
          // cursor is in a text node
          if (stringToVisibleText(textNode.textContent || "").length == 0 && position < textNode.length) {
            return {type: "emptyTextNodeEnd", node: textNode};
          } else if (position < textNode.length) {
            // can delete a character, the position remains the same
            return {type: "character", position: position, node: textNode};
          } else {
            // at the end of a non empty text node
            const nextSibling = textNode.nextSibling;
            if (nextSibling) {
              if (nextSibling.nodeType === Node.TEXT_NODE) {
                const sibling = nextSibling as Text;

                if (stringToVisibleText(sibling.textContent || "").length == 0) {
                  return {type: "emptyTextNodeStart", node: sibling};
                } else {
                  return {type: "character", position: 0, node: sibling};
                }
              } else if (nextSibling.nodeType === Node.ELEMENT_NODE) {
                const sibling = nextSibling as HTMLElement;
                if (isVoidElement(sibling)) {
                  return {type: "voidElement", node: sibling as VoidElement};
                } else {
                  return {type: "elementStart", node: sibling};
                }
              } else {
                const uncommonNode = ensureUncommonNode(nextSibling, "Assumed all node cases exhausted and uncommon node found in delete handler.  But node is not an uncommon node.");
                return {type: "uncommonNodeStart", node: uncommonNode};
              }
            } else if (textNode.parentElement) {
              const parent = textNode.parentElement;
              if (parent != this.rawEditor.rootNode) {
                return {type: "elementEnd", node: parent};
              } else {
                return {type: "editorRootEnd", node: parent};
              }
            } else {
              throw "no next sibling or parentnode found";
            }
          }
        } else {
          console.warn(`did not expect a startcontainer of type ${node.nodeType} from range`); // eslint-disable-line-console
          // there should not be an else per spec
        }
      }
      throw "delete handler only understands collapsed ranges";
    }
    throw "no selection found";
  }

  /**
   * Checks with each plugin if they have detected a change.
   *
   * @param {Manipulation} manipulation The change which was executed.
   * @return {boolean} True iff a plugin has detected a change.
   * @private
   * @method runChangeDetectionByPlugins
   */
  runChangeDetectionByPlugins(manipulation: DeleteHandlerManipulation): boolean {
    const reports =
      this
        .plugins
        .map((plugin) => {
          return {plugin, detectedChange: plugin.detectChange(manipulation)};
        })
        .filter(({detectedChange}) => detectedChange);

    // debug reporting
    for (const {plugin} of reports) {
      editorDebug(`delete-handler.runChangeDetectionByPlugins`, `Change detected by plugin ${plugin.label}`, {
        manipulation,
        plugin
      });
    }

    return reports.length > 0;
  }
}

/******************************************************************************
 * HELPERS (which should be moved to utils and used in other handlers)
 ******************************************************************************/

/**
 * Helper function: Given a reference DOMRect and a target,
 * re-map the coordinates compared to the reference
 * @method getRelativeDomRectCoordinates
 * @private
 *
 */
function getRelativeDomRectCoordinates(reference: DOMRect, target: DOMRect): DOMRect {
  return new DOMRect(
    target.x - reference.x,
    target.y - reference.y,
    target.width,
    target.height
  );
}

/**
 * Helper to compare 2 Arrays of DOMRect and to see wether any changes between them could be considered as a visual chancge.
 * TODO: this needs some refurbishing, now unclean absctraction.
 * @method checkVisibleChange
 * @private
 */
function checkVisibleChange(currentVisualCursorCoordinates: Array<DOMRect>,
                            previousVisualCursorCoordinates: Array<DOMRect>): boolean {

  if (!previousVisualCursorCoordinates.length && !currentVisualCursorCoordinates.length) {
    editorDebug(`delete-handler.checkVisibleChange`,
      `Did not see a visual change when removing character, no visualCoordinates whatsoever`,
      {new: currentVisualCursorCoordinates, old: previousVisualCursorCoordinates});
    return false;
  } else if (!previousVisualCursorCoordinates.length && currentVisualCursorCoordinates.length) {
    editorDebug(`delete-handler.checkVisibleChange`, `no previous coordinates`);
    return false;
  } else if (previousVisualCursorCoordinates.length && !currentVisualCursorCoordinates.length) {
    editorDebug(`delete-handler.checkVisibleChange`, 'no new coordinates');
    return true;
  }
  //Previous and current have visual coordinates, we need to compare the contents
  else {
    const {left: ol, top: ot} = previousVisualCursorCoordinates[0];


    const {left: nl, top: nt} = currentVisualCursorCoordinates[0];

    //TODO: on some screens we might see changes where there are none. Hence the treshold
    //TODO: think harder
    const visibleChange = Math.abs(ol - nl) > 0.1 || Math.abs(ot - nt) > 0.1;

    if (!visibleChange) {
      editorDebug(`delete-handler.checkVisibleChange`,
        `Did not see a visual change when removing character`,
        {new: currentVisualCursorCoordinates, old: previousVisualCursorCoordinates});
    }
    return visibleChange;
  }
}
