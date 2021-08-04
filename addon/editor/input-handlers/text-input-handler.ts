import {InputHandler, InputPlugin} from './input-handler';
import {Editor, InsertTextIntoRange, ManipulationGuidance} from './manipulation';
import {warn} from '@ember/debug';
import RdfaTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/rdfa/text-input-plugin';
import AnchorTagTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/anchor-tags/text-input-plugin';
import PlaceHolderTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/placeholder-text/text-input-plugin';
import {MisbehavedSelectionError, UnsupportedManipulationError} from "@lblod/ember-rdfa-editor/utils/errors";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers";

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
 * Text Input Handler, an event handler to handle text input.
 *
 * @module contenteditable-editor
 * @class TextInputHandler
 * @constructor
 */
export default class TextInputHandler extends InputHandler {
  plugins: Array<TextInputPlugin>;

  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    super(rawEditor);
    this.plugins = [
      new RdfaTextInputPlugin(),
      new AnchorTagTextInputPlugin(),
      new PlaceHolderTextInputPlugin()
    ];
  }

  isHandlerFor(event: Event): boolean {
    const selection = window.getSelection();

    return isKeyDownEvent(event)
      && selection !== null
      && this.rawEditor.rootNode.contains(selection.anchorNode)
      // Still composing, don't handle this.
      && !event.isComposing
      // It's a key combo, we don't want to do anything with this at the moment.
      && !(event.altKey || event.ctrlKey || event.metaKey)
      // Only interested in actual input, no control keys.
      && event.key.length <= 1;
  }

  handleEvent(event: KeyboardEvent) {
    const manipulation = this.getNextManipulation(event);
    // Check if we can execute it.
    const {mayExecute, dispatchedExecutor} = this.checkManipulationByPlugins(manipulation);

    // Error if we're not allowed to.
    if (!mayExecute) {
      warn(
        `Not allowed to execute manipulation for ${this.constructor.toString()}`,
        {id: "text-input-handler-manipulation-not-allowed"}
      );
      return {allowPropagation: false};
    }

    // Run the manipulation.
    if (dispatchedExecutor) {
      // NOTE: We should pass some sort of editor interface here in the future.
      dispatchedExecutor(manipulation, this.rawEditor);
    } else {
      this.handleNativeManipulation(manipulation);
    }

    return {allowPropagation: false};
  }

  handleNativeManipulation(manipulation: TextHandlerManipulation) {
    if (manipulation.type === "insertTextIntoRange") {
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

    return {type: "insertTextIntoRange", range, text: event.key};
  }
}

