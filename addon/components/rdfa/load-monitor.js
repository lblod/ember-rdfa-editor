import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

/**
 * Load monitor
 */
export default class LoadMonitor extends Component {
  /**
   * editor dispatcher
   * @property rdfaEditorDispatcher
   * @type {Service}
   * @private
   */
  @service
  rdfaEditorDispatcher;

  /**
   * All services which have an async task
   * @property taskServices
   * @type array
   * @private
   */
  get taskServices() {
    const tasks = [];
    for (const thing of this.rdfaEditorDispatcher.pluginServices || []) {
      if (thing.execute.perform) {
        tasks.push(thing);
      }
    }

    return tasks;
  }

  /**
   * is the editor blocked or is any plugin running
   */
  get allBusy() {
    return !!this.editorBusy && !!this.anyPluginBusy;
  }

  /**
   * Plugins available in the dispatcher
   * @returns {*[]}
   */
  get tasks() {
    return this.taskServices.map((service) => service.execute);
  }

  /**
   * is the editor working
   * @property editorBusy
   * @type boolean
   * @protected
   */
  get editorBusy() {
    if (!this.args.editor) {
      return true;
    }
    return this.args.editor.generateDiffEvents.isRunning === true;
  }

  /**
   * is any plugin scheduled or running
   * @property anyPluginBusy
   * @type boolean
   * @protected
   */
  get anyPluginBusy() {
    return this.tasks.some((t) => t.isRunning === true);
  }

  /**
   * Total number of plugins available
   * @property pluginsCount
   * @type number
   * @readOny
   */
  get pluginsCount() {
    return this.tasks.length;
  }

  /**
   * Number of plugins that are currently running or scheduled to run
   * @property busyPluginsCount
   * @type number
   * @protected
   */
  get busyPluginsCount() {
    return this.tasks.filter((t) => t.isRunning == true).length;
  }

  /**
   * Plugins that are currently running or scheduled to run
   * @property runningPlugins
   * @type Array
   * @protected
   */
  get runningPlugins() {
    return this.rdfaEditorDispatcher.pluginServices.filter(
      (p) => p.get('execute.isRunning') === true
    );
  }
}
