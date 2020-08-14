import { InputHandler } from './input-handler';
import { Manipulation, ManipulationExecutor, Editor, ManipulationGuidance } from './manipulation';
import { warn /*, debug, deprecate*/ } from '@ember/debug';
import RdfaTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/rdfa/text-input-plugin';
import AnchorTagTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/anchor-tags/text-input-plugin';

import { RawEditor } from '../raw-editor';
const NON_BREAKING_SPACE = '\u00A0';


/**
 * Interface for specific plugins.
 */
export interface TextInputPlugin {
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
}


/**
 *
 */
export function insertTextIntoTextNode(textNode: Node, position: number, inputText: string) {
  if (inputText === " ") {
    inputText = NON_BREAKING_SPACE;
  }
  const textContent = textNode.textContent || "";
  textNode.textContent = `${textContent.slice(0, position)}${inputText}${textContent.slice(position)}`;
  if (position > 0 && inputText !== NON_BREAKING_SPACE && textContent[position - 1] === NON_BREAKING_SPACE) {
    // replace non breaking space preceeding input with a regular space
    const content = textNode.textContent;
    textNode.textContent = content.slice(0, position - 1) + " " + content.slice(position);
  }
}

/**
 * Text Input Handler, a event handler to handle text input
 *
 * @module contenteditable-editor
 * @class TextInputHandler
 * @constructor
 */
export default class TextInputHandler implements InputHandler {
  rawEditor: RawEditor;
  plugins: Array<TextInputPlugin>;

  constructor( {rawEditor} : { rawEditor: RawEditor} ) {
    this.rawEditor = rawEditor;
    this.plugins = [
      new RdfaTextInputPlugin(),
      new AnchorTagTextInputPlugin()
    ];
  }

  isHandlerFor(event: Event) {
    const selection = window.getSelection();
    if (event.type == "keydown" && selection && this.rawEditor.rootNode.contains(selection.anchorNode)) {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.isComposing) {
        // still composing, don't handle this
        return false;
      }
      else if (keyboardEvent.altKey || keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
        // it's a key combo, we don't want to do anything with this atm
        return false
      }
      else if (keyboardEvent.key.length > 1) {
        // only interested in actual input, no control keys
        return false;
      }
      else {
        return true;
      }
    }
    else {
      return false;
    }
  }

  handleEvent(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    const manipulation = this.getNextManipulation(keyboardEvent);
    // check if we can execute it
    const { mayExecute, dispatchedExecutor } = this.checkManipulationByPlugins( manipulation );

    // error if we're not allowed to
    if ( ! mayExecute ) {
      warn( `Not allowed to execute manipulation for ${this.constructor}`, { id: "text-input-handler-manipulation-not-allowed" } );
      return { allowPropagation: false };
    }

    // run the manipulation
    if( dispatchedExecutor ) {
      // NOTE: we should pass some sort of editor interface here in the future.
      dispatchedExecutor( manipulation, this.rawEditor as Editor);
    }
    else {
      this.handleNativeManipulation( manipulation );
    }
    return { allowPropagation: false };
  }

  handleNativeManipulation(manipulation: Manipulation) {
    if (manipulation.type == "insertTextIntoTextNode") {
      const { node: textNode, position, text } = manipulation;
      insertTextIntoTextNode(textNode, position, text);
      this.rawEditor.updateRichNode();
      this.rawEditor.setCarret(textNode, position + 1);
    }
    else if (manipulation.type == "insertTextIntoElement") {
      const {node: element, position, text } = manipulation;
      if (position > 0 && element.childNodes[position-1].nodeType == Node.TEXT_NODE) {
        // node before the intented position is a text node, let's append to that one
        const textNode = element.childNodes[position-1] as Text;
        insertTextIntoTextNode(textNode, textNode.length, text);
        this.rawEditor.updateRichNode();
        this.rawEditor.setCarret(textNode, textNode.length);
      }
      else if (element.childNodes[position].nodeType == Node.TEXT_NODE) {
        // node after the intented position is a text node, let's append to that one
        const textNode = element.childNodes[position] as Text;
        insertTextIntoTextNode(textNode, textNode.length, text);
        this.rawEditor.updateRichNode();
        this.rawEditor.setCarret(textNode, text.length);
      }
      else {
        const textNode = document.createTextNode(text);
        if(position > 0){
          element.childNodes[position - 1].after(textNode);
        }
        else {
          element.prepend(textNode);
        }
        this.rawEditor.updateRichNode();
        this.rawEditor.setCarret(textNode, textNode.length);
      }
    }
    else if (manipulation.type == "replaceSelectionWithText") {
      const { selection, text } = manipulation;
      const range = selection.getRangeAt(0);
      if (range) {
        const {startContainer, endContainer, startOffset, endOffset } = range;
        if (startContainer.nodeType == Node.TEXT_NODE) {
          selection.deleteFromDocument();
          insertTextIntoTextNode(startContainer as Text, startOffset, text);
          this.rawEditor.updateRichNode();
          this.rawEditor.setCarret(startContainer, startOffset + text.length);
        }
        else if (endContainer.nodeType == Node.TEXT_NODE) {
          selection.deleteFromDocument();
          insertTextIntoTextNode(endContainer as Text, endOffset, text);
          this.rawEditor.updateRichNode();
          this.rawEditor.setCarret(endContainer, endOffset + text.length);
        }
        else {
          const textNode = document.createTextNode(text);
          selection.deleteFromDocument();
          startContainer.childNodes[startOffset - 1].after(textNode);
          this.rawEditor.updateRichNode();
          this.rawEditor.setCarret(textNode, textNode.length);
        }
      }
      else {
        console.warn("no selected range, not doing anything!");
      }
    }

    else {
      throw "unsupport manipulation";
    }
  }

  getNextManipulation(event: KeyboardEvent) : Manipulation {
    const selection = window.getSelection();
    if (selection?.isCollapsed) {
      const { anchorNode, anchorOffset } = selection;
      if (anchorNode?.nodeType == Node.TEXT_NODE) {
        return { type: "insertTextIntoTextNode", node: anchorNode as Text, position: anchorOffset, text: event.key };
      }
      else if (anchorNode?.nodeType == Node.ELEMENT_NODE) {
        return { type: "insertTextIntoElement", node: anchorNode as HTMLElement, position: anchorOffset, text: event.key};
      }
      else {
        throw "unsupported selection";
      }
    }
    else if (selection && this.rawEditor.rootNode.contains(selection.anchorNode)) {
      return { type: "replaceSelectionWithText", selection: selection, node: (selection.anchorNode as Node), text: event.key };
    }
    throw "selection is required for text input";
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
    const reports : Array<{ plugin: TextInputPlugin, allow: boolean, executor: ManipulationExecutor | undefined }> = [];
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
      console.debug(`Was not allowed to execute text manipulation by plugin ${plugin.label}`, { manipulation, plugin });
    }

    // yield result
    return {
      mayExecute: reportsNoExecute.length === 0,
      dispatchedExecutor: reportsWithExecutor.length ? reportsWithExecutor[0].executor as ManipulationExecutor : null
    };
  }

}

