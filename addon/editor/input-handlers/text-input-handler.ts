import {InputHandler} from './input-handler';
import {Manipulation, ManipulationExecutor, Editor, ManipulationGuidance} from './manipulation';
import {warn /*, debug, deprecate*/} from '@ember/debug';
import RdfaTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/rdfa/text-input-plugin';
import AnchorTagTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/anchor-tags/text-input-plugin';
import PlaceHolderTextInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/placeholder-text/text-input-plugin';
import LegacyRawEditor from "@lblod/ember-rdfa-editor/utils/ce/legacy-raw-editor";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError, UnsupportedManipulationError} from "@lblod/ember-rdfa-editor/utils/errors";

const NON_BREAKING_SPACE = '\u00A0';

interface ManipulationGuidance {
  allow: boolean | undefined
  executor: ManipulationExecutor | undefined
}

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
 * Text Input Handler, a event handler to handle text input
 *
 * @module contenteditable-editor
 * @class TextInputHandler
 * @constructor
 */
export default class TextInputHandler implements InputHandler {
  rawEditor: LegacyRawEditor;
  plugins: Array<TextInputPlugin>;

  constructor({rawEditor}: { rawEditor: LegacyRawEditor }) {
    this.rawEditor = rawEditor;
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

  handleNativeManipulation(manipulation: Manipulation) {
    if(manipulation.type === "insertTextIntoRange") {
      this.rawEditor.executeCommand("insert-text", manipulation.text, manipulation.range);
    } else {
      throw new UnsupportedManipulationError(manipulation);
    }
  }

  getNextManipulation(event: KeyboardEvent): Manipulation {
    const range = this.rawEditor.model.selection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }
    return {type: "insertTextIntoRange", range, text: event.key};
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
  checkManipulationByPlugins(manipulation: Manipulation): { mayExecute: boolean, dispatchedExecutor: ManipulationExecutor | null } {
    // calculate reports submitted by each plugin
    const reports: Array<{ plugin: TextInputPlugin, allow: boolean, executor: ManipulationExecutor | undefined }> = [];
    for (const plugin of this.plugins) {
      const guidance = plugin.guidanceForManipulation(manipulation);
      if (guidance) {
        const allow = guidance.allow === undefined ? true : guidance.allow;
        const executor = guidance.executor;
        reports.push({plugin, allow, executor});
      }
    }

    // filter reports based on our interests
    const reportsNoExecute = reports.filter(({allow}) => !allow);
    const reportsWithExecutor = reports.filter(({executor}) => executor);

    // debug reporting
    if (reports.length > 1) {
      console.warn(`Multiple plugins want to alter this manipulation`, reports);
    }
    if (reportsNoExecute.length > 1 && reportsWithExecutor.length > 1) {
      console.error(`Some plugins don't want execution, others want custom execution`, {
        reportsNoExecute,
        reportsWithExecutor
      });
    }
    if (reportsWithExecutor.length > 1) {
      console.warn(`Multiple plugins want to execute this plugin. First entry in the list wins: ${reportsWithExecutor[0].plugin.label}`);
    }

    for (const {plugin} of reportsNoExecute) {
      console.debug(`Was not allowed to execute text manipulation by plugin ${plugin.label}`, {manipulation, plugin});
    }

    // yield result
    return {
      mayExecute: reportsNoExecute.length === 0,
      dispatchedExecutor: reportsWithExecutor.length ? reportsWithExecutor[0].executor as ManipulationExecutor : null
    };
  }

}

