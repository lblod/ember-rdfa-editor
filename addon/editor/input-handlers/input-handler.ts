import {
  Manipulation,
  ManipulationExecutor,
  ManipulationGuidance
} from "@lblod/ember-rdfa-editor/editor/input-handlers/manipulation";
import {editorDebug} from "@lblod/ember-rdfa-editor/editor/utils";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";

export interface HandlerResponse {
  /**
   * specify if the event can also handled by another handler
   * @property allowPropagation
   * @type boolean
   * @default true
   * @public
   */
  allowPropagation: boolean
}

export interface InputPlugin {
  /**
   * One-liner explaining what the plugin solves.
   */
  label: string;

  /**
   * Callback executed to see if the plugin allows a certain
   * manipulation and/or if it intends to handle the manipulation
   * itself.
   */
  guidanceForManipulation: (manipulation: Manipulation, editor: PernetRawEditor) => ManipulationGuidance | null;
}

export abstract class InputHandler {
  plugins: InputPlugin[];
  protected rawEditor: PernetRawEditor;

  constructor(rawEditor: PernetRawEditor) {
    this.rawEditor = rawEditor;
    this.plugins = [];
  }

  abstract isHandlerFor(event: Event): boolean;

  abstract handleEvent(event: Event): HandlerResponse;

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
    const reports: Array<{ plugin: InputPlugin, allow: boolean, executor: ManipulationExecutor | undefined }> = [];
    for (const plugin of this.plugins) {
      const guidance = plugin.guidanceForManipulation(manipulation, this.rawEditor);
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
      editorDebug(`${this.constructor.name}.checkManipulationByPlugins`,
        `Was not allowed to execute text manipulation by plugin ${plugin.label}`,
        {manipulation, plugin});
    }

    // yield result
    return {
      mayExecute: reportsNoExecute.length === 0,
      dispatchedExecutor: reportsWithExecutor.length ? reportsWithExecutor[0].executor as ManipulationExecutor : null
    };
  }
}
