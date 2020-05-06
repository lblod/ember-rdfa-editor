import HandlerResponse from './handler-response';
import { warn /*, debug, deprecate*/ } from '@ember/debug';
import { mergeSiblingTextNodes } from '../rich-node-tree-modification';

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

interface Manipulation {
  type: string;
}

interface RemoveEmptyTextNodeManipulation extends Manipulation {
  type: "removeEmptyTextNode";
  node: Text;
}

interface RemoveCharacterManipulation extends Manipulation {
  type: "removeCharacter";
  node: Text;
  position: number;
}

/**
 * A specific location in the document.
 *
 * If type is a character, the position indicates the character after
 * the supplied index.  In the string `hello`, the first l would be index
 * 2.
 */
interface ThingBeforeCursor {
  type: "character" | "textNode"
}

interface CharacterPosition extends ThingBeforeCursor {
  type: "character";
  node: Text;
  position: any;
}

interface TextNodePosition extends ThingBeforeCursor {
  type: "textNode";
  node: Text;
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
    window.requestAnimationFrame( () => window.setTimeout(0, () => cb()) );
  });
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
      warn("Too many backspace tries, giving up removing content");
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
    const { previousVisualCursorCoordinates } = options;

    const { left: ol, top: ot } = previousVisualCursorCoordinates[0];
    const { left: nl, top: nt } = this.carretClientRects[0];

    const visibleChange = ol !== nl || ot !== nt;

    if( !visibleChange ){
      console.log(`Did not see a visual change when removing character`, { new: this.carretClientRects, old: previousVisualCursorCoordinates });
    }

    return visibleChange;
  }

  /**
   * Yields a ClientRect for the current cursor position.
   *
   * @method carretClientRect
   * @private
   *
   * @return {ClientRect} The first position of the selected range or cursor position.
   */
  get carretClientRect() : ClientRect {
    return window.getSelection().getRangeAt(0).getClientRects()[0];
  }

  /**
   * Yields a ClientRect for the current cursor position.
   *
   * @method carretClientRect
   * @private
   *
   * @return {ClientRect} The first position of the selected range or cursor position.
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
        // TODO: set carrect to correct position based on previous element
      } else {
        throw "Requested to remove text node which does not have a parent node";
      }
    }
    // else if ( manipulation.type == "removeNode") {
    //   manipulation.node.remove();
    //   this.rawEditor.updateRichNode();
    //   this.setCarret();
    // }
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
  getNextManipulation() : RemoveCharacterManipulation | RemoveEmptyTextNodeManipulation
  {
    // check where our cursor is and get the deepest "thing" before
    // the cursor (character or node)
    const thingBeforeCursor: ThingBeforeCursor = this.getDeepestThingBeforeCursor();

    // we are in a text node and we can remove an extra character
    if( thingBeforeCursor.type == "character" ) {
      // character: remove the character
      const characterBeforeCursor = thingBeforeCursor as CharacterPosition;
      return {
        type: "removeCharacter",
        node: characterBeforeCursor.node,
        position: characterBeforeCursor.position
      };
    } else if( thingBeforeCursor.type == "textNode" ) {
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
    }




    if (thingBeforeCursor.type == "node") {
      const textNode = this.currentNode;
      if (textNode && textNode.textContent.length == 0) { // TODO: this should be smarter and take into account visible length
        return {
          type: "removeNode",
          node: textNode,
          position: 0
        }
      }
      else {
        return {
          // jump into next logical text node
        }
      }
    }


    // TODO: take care of other cases
    throw "Could not find next manipulation";
  }

  /**
   * Retrieves the thing before the cursor position.
   *
   * @method getDeepestThingBeforeCursor
   * @public
   */
  getDeepestThingBeforeCursor() : ThingBeforeCursor
  {
    // TODO: it is a bit unclear how to best address this.  What
    // should this return exactly in all cases and how should we best
    // implement it.  The implementation itself must be hidden
    // somewhere in previously written code.

    // check where the cursor is
    const position = this.currentSelection[0];
    const textNode = this.currentNode;
    const richNode = this.rawEditor.getRichNodeFor(textNode);
    // TODO: allow plugins to hook into this?
    const relPosition = this.absoluteToRelativePosition(richNode, position);
    if( relPosition >= 1 ) {
      // the cursor is in a text node
      return { type: "character", position: relPosition - 1, node: textNode };
    } else {
      const previousSibling = textNode.previousSibling;
      if( previousSibling ) {
        if( previousSibling.nodeType === Node.TEXT_NODE ) {
          let sibling = previousSibling as Text;
          if( sibling.length > 0 ) {
            // previous is text node with stuff
            return { type: "character", position: sibling.length - 1, node: sibling }
          } else {
            // previous is empty text node
            return { type: "node", node: sibling };
          }
        } else {

        }
      }

      // we must jump to the position before the cursor find the DOM
      // node before us and go as deep to the right as possible in
      // that.
      if (textNode.previousSibling) {
        return { type: "node", position: null, node: textNode.previousSibling };
      }
      else if (textNode.parentNode && textNode.parentNode != this.rawEditor.rootNode) {
        return { type: "node", position: null, node: textNode.parentNode };
      }
      else if (textNode.parentNode && textNode.parentNode == this.rawEditor.rootNode) {
        return { type: "root", position: null, node: textNode.parentNode };
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
