import HandlerResponse from './handler-response';
import { warn /*, debug, deprecate*/ } from '@ember/debug';
import { isVoidElement } from '../dom-helpers';

interface RawEditor {
  currentSelectionIsACursor: boolean,
  getRichNodeFor( node: Node ): RichNode
  externalDomUpdate: ( description: string, action: () => void ) => void
  currentPosition: number
  setCurrentPosition: (position: number) => void
  generateDiffEvents: Task,
  setCarret: ( node: Node, position: number ) => void
  setPosition: ( position: number ) => void
  updateRichNode(): () => void
  rootNode: Node
  currentSelection: RawEditorSelection
  richNode: RichNode
  currentNode: Node
}

interface RawEditorSelection extends Array<number> {

}

interface RichNode {
  start: number;
}

/**
 * Contains a set of all currently supported manipulations.
 */
type Manipulation =
  RemoveEmptyTextNodeManipulation
  | RemoveCharacterManipulation
  | RemoveEmptyElementManipulation
  | RemoveVoidElementManipulation
  | RemoveOtherNodeManipulation
  | MoveCursorToEndOfNodeManipulation;

/**
 * Base type for any manipulation, ensuring the type interface exists.
 */
interface BaseManipulation {
  type: string;
}

/**
 * Represents the removal of an empty text node.
 */
interface RemoveEmptyTextNodeManipulation extends BaseManipulation {
  type: "removeEmptyTextNode";
  node: Text;
}

/**
 * Represents the removal of a single character from a text node.
 */
interface RemoveCharacterManipulation extends BaseManipulation {
  type: "removeCharacter";
  node: Text;
  position: number;
}

/**
 * Represents the removal of an empty Element (so an Element without childNodes)
 */
interface RemoveEmptyElementManipulation extends BaseManipulation {
  type: "removeEmptyElement";
  node: Element;
}

/**
 * Represents the removal of a void element
 */
interface RemoveVoidElementManipulation extends BaseManipulation {
  type: "removeVoidElement";
  node: Element;
}

/**
 * Represents moving the cursor after the last child of node
 */
interface MoveCursorToEndOfNodeManipulation extends BaseManipulation {
  type: "moveCursorToEndOfNode";
  node: Element;
}

/**
 * Represents the removal of a node that is not of type Text of Element
 */
interface RemoveOtherNodeManipulation extends BaseManipulation {
  type: "removeOtherNode";
  node: Node;
}

/**
 * A specific location in the document.
 *
 * If type is a character, the position indicates the character after
 * the supplied index.  In the string `hello`, the first l would be index
 * 2.
 */
type ThingBeforeCursor =
  CharacterPosition
  | TextNodePosition
  | ElementStartPosition
  | ElementEndPosition
  | OtherNodeEndPosition
  | EditorRootPosition

interface BaseThingBeforeCursor {
  type: string;
}

/**
 * There is a character before the cursor.
 * We consider the current position of the cursor to be either inside the provided node
 * or in an adjacent text node.
 */
interface CharacterPosition extends BaseThingBeforeCursor {
  type: "character";
  node: Text;
  position: any;
}


/**
 * A Text node before the cursor, the text node is empty
 * We consider the current position of the cursor right after the provided node
 * TODO: should it matter that it is empty? perhaps rename to empty text node?
 */
interface TextNodePosition extends BaseThingBeforeCursor {
  type: "textNode";
  node: Text;
}

/**
 * An element before the cursor and the cursor is currently inside the element
 * We consider the current position of the cursor at the very beginning of the element
 */
interface ElementStartPosition extends BaseThingBeforeCursor {
  type: "elementStart";
  node: Element;
}

/**
 * An element before the cursor (cursor currently outside the element)
 * We consider the cursor to be right after the element
 */
interface ElementEndPosition extends BaseThingBeforeCursor {
  type: "elementEnd";
  node: Element;
}

/**
 * A node that is not of type Text or Element before the cursor
 * We consider the current cursor position to be right after the node.
 * see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType for all possible types
 * TODO: do we want to split this up further? In theory the only other expected types are Comment and (possibly) CDATASection
 */
interface OtherNodeEndPosition extends BaseThingBeforeCursor {
  type: "otherNodeEnd";
  node: Node;
}

/**
 * The root element of the editor is right before the cursor
 * We consider the current cursor position to be at the very beginning of the editor
 */
interface EditorRootPosition extends BaseThingBeforeCursor {
  type: "editorRootStart";
  node: Element;
}

interface BackspacePlugin {
  label: string;
  allowManipulation: (manipulation: Manipulation) => boolean;
  detectChange: (manipulation: Manipulation) => boolean;
}

interface Task {
  perform: () => void;
}

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
function paintCycleHappened() : Promise<void> {
  return new Promise( (cb) => {
    requestAnimationFrame( () =>
      setTimeout(() => {
        cb();
      }, 0 ) );
  } );
}

/**
 * Backspace Handler, an event handler to handle removing content
 * behind the cursor.
 *
 * This handler tries to remove subsequent DOM content until we have a
 * clue that something has changed.  What "something has changed"
 * means can be extended so other use-cases can be catered for.
 *
 * ## High level operation
 *
 * The general idea of the backspace handler goes as follows:
 *
 * - find the innermost thing before the cursor.
 * - try to remove that thing
 * - repeat until there is a visual difference
 *
 * ## Why do we have plugins?
 *
 * Different content-editable implementations may show different
 * information to the user.  What can be removed and what is visible
 * may therefore differ.  As such, the backspace handler allows
 * plugins to register and inform the backspace handler on their
 * extended interpretation of reality.
 *
 * Extensions use hooks to indicate their interpretation of reality.
 * The inner workings of the backspace handler itself are also
 * governed by these hooks.
 *
 * The downside of these hooks is that it may lead to jumping through
 * the code to random places.  However, we note that although the
 * backspace handler should have high cohesion, so should features
 * which have impact on the backspace handling.  By merging the
 * backspace handler with features which impact the backspace
 * handling, the code around such features becomes more distributed,
 * leading to a lower cohesion on that front.  We hope the locations
 * of the code will interprets certain alterations will be limited in
 * practice and assume that having code for specific features together
 * brings more value than embedding them in terms of backspace.
 *
 * ## What can plugins do?
 *
 * Plugins are called on various hooks depending on the logic they
 * need.  Because these hooks describe their understanding of the
 * world, they can be combined at a high level and should thus not
 * interfece with each other.  Initial implementation will assume no
 * interference is possible and will warn on unexpected conflicts.
 *
 * ### Decide on removal of item
 *
 * Each iteration may desire to remove an element from the DOM tree.
 * A plugin may indicate that this item should be skipped, that it
 * cannot be removed, or that it will handle the removal.
 *
 * ### Remove the thing
 *
 * By default the action of removal is executed on the DOM tree.  Any
 * plugin may decide to handle the action itself, thereby altering the
 * DOM tree in a different-than-default way.
 *
 * ### Detect visual difference
 *
 * Whenever the user presses backspace, a visual difference should
 * occur.  If a plugin has more information on visual changes, it may
 * inform a visual change has occurred, causing the backspace handler
 * to stop removing content.
 *
 * @module contenteditable-editor
 * @class BackspaceHandler
 * @constructor
 * @extends EmberObject
 */
export default class BackspaceHandler {

  /**
   * The editor instance on which we can execute changes.
   *
   * @property rawEditor
   * @type RawEditor
   * @default null
   */
  rawEditor: RawEditor;

  /**
   * Array containing all plugins for the backspace handler.
   */
  plugins: Array<BackspacePlugin> = [];

  /////////////////////
  // CALLBACK INTERFACE
  /////////////////////

  /**
   * Constructs a backspaceHandler instance
   *
   * @param {RawEditor} options.rawEditor Instance which will be used
   * to inspect and update the DOM tree.
   * @public
   * @constructor
   */
  constructor({ rawEditor }: { rawEditor: RawEditor }){
    this.rawEditor = rawEditor;
  }

  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {KeyboardEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event: KeyboardEvent) {
    return event.type === "keydown"
      && event.key === 'Backspace'
      && this.rawEditor.currentSelectionIsACursor
      && this.doesCurrentNodeBelongToContentEditable();
  }

  /**
   * handle backspace event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent() {
    this.backspace();
    // this.rawEditor.externalDomUpdate('backspace', () => this.backspace());
    return HandlerResponse.create({ allowPropagation: false });
  }

  /////////////////
  // IMPLEMENTATION
  /////////////////

  /**
   * General control-flow for the backspace-handling.
   *
   * @method backspace
   * @private
   */
  async backspace( max_tries = 50 ) {
    if( max_tries == 0 ) {
      warn("Too many backspace tries, giving up removing content", { id: "backspace-handler-too-many-tries"});
      return;
    }

    const visualCursorCoordinates = this.carretClientRects;

    // search for a manipulation to execute
    const manipulation = this.getNextManipulation();

    // check if we can execute it
    const { mayExecute, dispatchedExecutor } = this.checkManipulationByPlugins( manipulation );

    // error if we're not allowed to
    if ( ! mayExecute ) {
      warn( "Not allowed to execute manipulation for backspace", { id: "backspace-handler-manipulation-not-allowed" } );
      return;
    }

    // run the manipulation
    if( dispatchedExecutor ) {
      dispatchedExecutor( manipulation );
    } else {
      this.handleNativeManipulation( manipulation );
    }

    // ask plugins if something has changed
    await paintCycleHappened();
    const pluginSeesChange = this.runChangeDetectionByPlugins( manipulation );

    // maybe iterate again
    if( pluginSeesChange || this.checkVisibleChange( { previousVisualCursorCoordinates: visualCursorCoordinates } ) ) {
      // TODO: do we need to make sure cursor state in the editor corresponds with browser state here?
      return;
    } else {
      // debugger;
      await this.backspace( max_tries -1 );
    }
  }

  /**
   * Returns truethy if a visual change could be detected.
   *
   * @method checkVisibleChange
   * @private
   *
   * @param options.previousVisualCursorCoordinates {ClientRect}
   * Visual coordinates of the carret position before the operation
   * occured.
   */
  checkVisibleChange( options: {previousVisualCursorCoordinates: ClientRectList | DOMRectList}  ) : boolean {

    const { previousVisualCursorCoordinates } = options

    if( ! previousVisualCursorCoordinates.length && ! this.carretClientRects.length ){
      console.log(`Did not see a visual change when removing character, no visualCoordinates whatsoever`,
                  { new: this.carretClientRects, old: previousVisualCursorCoordinates });
      return false;
    }
    else if( ! previousVisualCursorCoordinates.length && this.carretClientRects.length ){
      return true;
    }
    else if( previousVisualCursorCoordinates.length && ! this.carretClientRects.length ){
      return true;
    }
    //Previous and current have visual coordinates, we need to compare the contents
    else {
      const { left: ol, top: ot } = previousVisualCursorCoordinates[0];


      const { left: nl, top: nt } = this.carretClientRects[0];

      const visibleChange = ol !== nl || ot !== nt;

      if( !visibleChange ){
        console.log(`Did not see a visual change when removing character`, { new: this.carretClientRects, old: previousVisualCursorCoordinates });
      }

      return visibleChange;
    }
  }

  /**
   * Yields all {ClientRect} for the current cursor position.
   *
   * @method carretClientRects
   * @private
   *
   * @return [ { ClientRect } ] The positions of the selected range or cursor position.
   */
  get carretClientRects() : DOMRectList | ClientRectList {
    return window.getSelection().getRangeAt(0).getClientRects();
  }

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
    if( manipulation.type == "removeCharacter" ) {
      const removeCharacterManipulation = manipulation as RemoveCharacterManipulation;
      const { node, position } = removeCharacterManipulation;
      const nodeText = node.textContent || "";
      node.textContent = `${nodeText.slice(0, position)}${nodeText.slice( position + 1)}`;
      this.rawEditor.updateRichNode();
      this.rawEditor.setCarret( node, position );
    }
    else if( manipulation.type === "removeEmptyTextNode" ) {
      const removeEmptyTextNodeManipulation = manipulation as RemoveEmptyTextNodeManipulation;
      const { node: textNode } = removeEmptyTextNodeManipulation;
      if( textNode.parentNode ) {
        textNode.parentNode.removeChild( textNode );
        // TODO: we explicitly do NOT set carret to trigger a next iteration in backspace()
        //       NOTE: if no other iteration follows, we might not end in valid editor state
      } else {
        throw "Requested to remove text node which does not have a parent node";
      }
    }
    else if ( manipulation.type === "removeEmptyElement" ) {
      const removeEmptyElementManipulation = manipulation as RemoveEmptyElementManipulation;
      const emptyElement = removeEmptyElementManipulation.node;
      const parentElement = emptyElement.parentElement as Element;
      const indexOfElement = Array.from(parentElement.childNodes).indexOf(emptyElement);
      this.rawEditor.setCarret(parentElement, indexOfElement); // place the cursor before the removed element
      emptyElement.remove();
      this.rawEditor.updateRichNode();
    }
    else if ( manipulation.type === "removeOtherNode") {
      const removeOtherNodeManipulation = manipulation as RemoveOtherNodeManipulation;
      const otherNode = removeOtherNodeManipulation.node;
      const parentElement = otherNode.parentElement as Element;
      const indexOfElement = Array.from(parentElement.childNodes).indexOf(otherNode);
      this.rawEditor.setCarret(parentElement, indexOfElement); // place the cursor before the removed element
      parentElement.removeChild(otherNode);
      this.rawEditor.updateRichNode();
    }
    else if ( manipulation.type === "removeVoidElement" ) {
      // TODO: currently this is a duplication of removeEmptyElement, do we need this extra branch?
      const voidManipulation = manipulation as RemoveVoidElementManipulation;
      const voidElement = voidManipulation.node;
      const parentElement = voidElement.parentElement as Element;
      const indexOfElement = Array.from(parentElement.childNodes).indexOf(voidElement);
      this.rawEditor.setCarret(parentElement, indexOfElement); // place the cursor before the removed element
      voidElement.remove();
      this.rawEditor.updateRichNode();
    }
    else if ( manipulation.type === "moveCursorToEndOfNode" ) {
      // TODO: should this actually move your cursor at this point?
      // setCarret creates textnodes if necessary to ensure a cursor can be placed
      const moveCursorManipulation = manipulation as MoveCursorToEndOfNodeManipulation;
      const element = moveCursorManipulation.node;
      const length = element.childNodes.length;
      this.rawEditor.setCarret(element, length);
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
    // check where our cursor is and get the deepest "thing" before
    // the cursor (character or node)
    const thingBeforeCursor: ThingBeforeCursor = this.getThingBeforeCursor();

    switch( thingBeforeCursor.type ) {

      case "character":
        // character: remove the character
        const characterBeforeCursor = thingBeforeCursor as CharacterPosition;
        return {
          type: "removeCharacter",
          node: characterBeforeCursor.node,
          position: characterBeforeCursor.position
        };
        break;

      case "textNode":
        // empty text node: remove the text node
        const textNodeBeforeCursor = thingBeforeCursor as TextNodePosition;
        if( textNodeBeforeCursor.node.length === 0 ) {
          return {
            type: "removeEmptyTextNode",
            node: textNodeBeforeCursor.node
          };
        } else {
          throw "Received text node which is not empty as previous node.  Some assumption broke.";
        }
        break;

      case "elementEnd":
        const elementBeforeCursor = thingBeforeCursor as ElementEndPosition;
        if ( isVoidElement(elementBeforeCursor.node) ) {
          return {
            type: "removeVoidElement",
            node: elementBeforeCursor.node as Element
          }
        }
        else {
          return {
            type: "moveCursorToEndOfNode",
            node: elementBeforeCursor.node
          };
        }
        break;

      case "elementStart":
        const parentBeforeCursor = thingBeforeCursor as ElementStartPosition;
        const element = parentBeforeCursor.node;
        if (element.childNodes.length == 0) {
          return {
            type: "removeEmptyElement",
            node: element
          };
        }
        else {
          console.debug("currently unsupported: at start of element, but it's not empty", element);
        }
        break;
      case "otherNodeEnd":
        const positionBeforeCursor = thingBeforeCursor as OtherNodeEndPosition;
        const node = positionBeforeCursor.node;
        return {
          type: "removeOtherNode",
          node: node
        };
        break;
    }

    // TODO: take care of other cases
    throw `Could not find manipulation to suggest for backspace ${thingBeforeCursor.type}`;
  }

  /**
   * Retrieves the thing before the cursor position.
   *
   * # What is the thing before a cursor position?
   *
   * The cursor position is basically always in a text node.  But the
   * thing before a cursor could be one of many things.  Considering
   * the following snippet:
   *
   *     ab[]cde<span>fg</span>hjk<b><i>lmn</i></b>op.
   *
   * Consider [] to be a blank text node.  The carret position is
   * described as being 'at' or before a character letter.
   *
   * ## Case a character
   *
   * ## Case a textNode
   *
   * ## Case a void element (br, hr, img, meta, ... elements that can't have childNodes)
   *
   * ## Case an element
   *
   * ## Case a node that is neither element, nor textnode
   *
   * ## Case nothing, but we have a parentNode (and it's not the editor)
   *
   * ## Case nothing, and the editor is our parentNode
   *
   * @method getThingBeforeCursor
   * @public
   */
  getThingBeforeCursor() : ThingBeforeCursor
  {
    // TODO: it is a bit unclear how to best address this.  What
    // should this return exactly in all cases and how should we best
    // implement it.  The implementation itself must be hidden
    // somewhere in previously written code.

    // check where the cursor is
    // TODO: should we support actual selections here as well or will that be a different handler?
    // current implementation assumes a collapsed selection (e.g. a carret)
    // NOTE: currentNode can be null, in case of an actual selection
    const position = this.currentSelection[0];
    const textNode = this.currentNode as Text;
    const richNode = this.rawEditor.getRichNodeFor(textNode);
    // TODO: allow plugins to hook into this?
    const relPosition = this.absoluteToRelativePosition(richNode, position);
    if( relPosition >= 1 ) {
      // the cursor is in a text node
      return { type: "character", position: relPosition - 1, node: textNode};
    }
    else if (textNode.length == 0){
      // at the start an empty text node
      return { type: "textNode", node: textNode};
    }
    else {
      // start of textnode (relposition = 0)
      const previousSibling = textNode.previousSibling;
      if( previousSibling ) {
        if( previousSibling.nodeType === Node.TEXT_NODE ) {
          let sibling = previousSibling as Text;
          if( sibling.length > 0 ) {
            // previous is text node with stuff
            return { type: "character", position: sibling.length - 1, node: sibling};
          } else {
            // previous is empty text node
            return { type: "textNode", node: sibling};
          }
        }
        else if( previousSibling.nodeType === Node.ELEMENT_NODE ){
          const sibling  = previousSibling as Element;
          return { type: "elementEnd", node: sibling };
        }
        else {
          return { type: "otherNodeEnd", node: previousSibling };
        }
      }
      else if (textNode.parentElement) {
        const parent = textNode.parentElement as Element;
        if (textNode.parentElement != this.rawEditor.rootNode) {
          return { type: "elementStart", node: parent };
        }
        else {
          return { type: "editorRootStart", node: parent };
        }
      }
      else {
        throw "no previous sibling or parentnode found"
      }
    }
    throw "Unsupported path in getDeepestThingBeforeCursor";

    // // else if the cursor is inside the only invisible space
    // //   if this is the only node of our parent, delete the parent
    // //   if this is not the only node of our parent
    // //     jump over invisible space, suggest deletion one character back
    // // ACTUAL LOGIC MAY BE MORE COMPLEX: can we figure out if we need the invisible space or not?
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
  checkManipulationByPlugins(manipulation: Manipulation) : { mayExecute: boolean, dispatchedExecutor: ( (manipulation: Manipulation) => void ) | null } {
    const reports =
          this
          .plugins
          .map( (plugin) => {
            return {
              plugin,
              allow: plugin.allowManipulation( manipulation )
            }; } )
          .filter( ({allow}) => !allow );

    // debug reporting
    for( const { plugin } of reports ) {
      console.debug(`Was not allowed to execute backspace manipulation by plugin ${plugin.label}`, { manipulation, plugin });
    }

    return {
      mayExecute: reports.length === 0,
      dispatchedExecutor: null
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
      console.debug(`Change detected by plugin ${plugin.label}`, { manipulation, plugin });
    }

    return reports.length > 0;
  }

  get rootNode() : Node {
    return this.rawEditor.rootNode;
  }

  get currentSelection(){
    return this.rawEditor.currentSelection;
  }
  get richNode() : RichNode {
    return this.rawEditor.richNode;
  }
  get currentNode() : Node {
    return this.rawEditor.currentNode;
  }


  doesCurrentNodeBelongToContentEditable() : boolean {
    return this.currentNode && this.currentNode.parentNode && this.currentNode.parentNode.isContentEditable;
  }

  /**
   * Given richnode and absolute position, retrieves the relative
   * position to the text node.
   *
   * @method absoluteToRelativePostion
   * @param {Object} richNode Richnode which contains the cursor.
   * @param {Int} position Absolute position of the cursor in the document.
   * @return {Int} Position of the cursor relative to `richNode`.
   * @private
   */
  absoluteToRelativePosition(richNode: RichNode, position : number) {
    return Math.max(position - ( richNode.start || 0 ));
  }
}
