import {InputHandler, InputPlugin} from './input-handler';
import {Editor, InsertTextIntoRange, ManipulationGuidance} from './manipulation';
import {warn} from '@ember/debug';
import RdfaTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/rdfa/text-input-plugin';
import AnchorTagTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/anchor-tags/text-input-plugin';
import PlaceHolderTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/placeholder-text/text-input-plugin';
import {MisbehavedSelectionError, UnsupportedManipulationError} from "@lblod/ember-rdfa-editor/utils/errors";
import {NON_BREAKING_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";


export type TextHandlerManipulation = InsertTextIntoRange;

/**
 * Interface for specific plugins.
 */
export interface TextInputPlugin extends InputPlugin {
  /**
   * Callback executed to see if the plugin allows a certain
   * manipulation and/or if it intends to handle the manipulation
   * itself.
   */
  guidanceForManipulation: (manipulation: TextHandlerManipulation) => ManipulationGuidance | null;
}

/**
 * Text Input Handler, a event handler to handle text input
 *
 * @module contenteditable-editor
 * @class TextInputHandler
 * @constructor
 */
export default class TextInputHandler extends InputHandler {
  plugins: Array<TextInputPlugin>;

  constructor({rawEditor}: { rawEditor: PernetRawEditor }) {
    super(rawEditor);
    this.plugins = [
      new RdfaTextInputPlugin(),
      new AnchorTagTextInputPlugin(),
      new PlaceHolderTextInputPlugin()
    ];
  }

  isHandlerFor(event: Event) {
    const selection = window.getSelection();
    if (event.type == "keydown" && selection && this.rawEditor.rootNode.contains(selection.anchorNode)) {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.isComposing) {
        // still composing, don't handle this
        return false;
      } else if (keyboardEvent.altKey || keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
        // it's a key combo, we don't want to do anything with this atm
        return false;
      } else if (keyboardEvent.key.length > 1) {
        // only interested in actual input, no control keys
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  handleEvent(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    const manipulation = this.getNextManipulation(keyboardEvent);
    // check if we can execute it
    const {mayExecute, dispatchedExecutor} = this.checkManipulationByPlugins(manipulation);

    // error if we're not allowed to
    if (!mayExecute) {
      warn(`Not allowed to execute manipulation for ${this.constructor.toString()}`, {id: "text-input-handler-manipulation-not-allowed"});
      return {allowPropagation: false};
    }

    // run the manipulation
    if (dispatchedExecutor) {
      // NOTE: we should pass some sort of editor interface here in the future.
      dispatchedExecutor(manipulation, this.rawEditor as Editor);
    } else {
      this.handleNativeManipulation(manipulation);
    }
    return {allowPropagation: false};
  }

  handleNativeManipulation(manipulation: TextHandlerManipulation) {
    console.log("handling native manip");
    if (manipulation.type === "insertTextIntoRange") {
      console.log(manipulation);
      this.rawEditor.executeCommand("insert-text", manipulation.text, manipulation.range);
    } else {
      throw new UnsupportedManipulationError(manipulation);
    }
  }

  getNextManipulation(event: KeyboardEvent): TextHandlerManipulation {
    const range = this.rawEditor.model.selection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }
    const text = event.key === " " ? NON_BREAKING_SPACE : event.key;
    return {type: "insertTextIntoRange", range, text};
  }


}

