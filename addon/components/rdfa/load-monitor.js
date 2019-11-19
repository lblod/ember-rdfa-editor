import { and } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/load-monitor';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { length } from 'ember-awesome-macros/array';
import { mapBy } from '@ember/object/computed';

/**
 * Load monitor
 * @module rdfa-editor
 * @class RdfaEditorLoadMonitor
 * @construct
 */
export default Component.extend({
  layout,
  /**
   * editor dispatcher
   * @property rdfaEditorDispatcher
   * @type {Service}
   * @private
   */
  rdfaEditorDispatcher: service(),

  /**
   * plugins available in the dispatcher
   * @property tasks
   * @type array
   * @protected
   */
  tasks: mapBy('rdfaEditorDispatcher.pluginServices', 'execute'),

  /**
   * is the editor working
   * @property editorBusy
   * @type boolean
   * @protected
   */
  editorBusy: computed('editor.generateDiffEvents.isRunning', function(){
    if(!this.editor) return true;
    return this.get('editor.generateDiffEvents.isRunning') == true;
  }),

  /**
   * is any plugin scheduled or running
   * @property anyPluginBusy
   * @type boolean
   * @protected
   */
  anyPluginBusy: computed('tasks.@each.isRunning', function(){
    return this.tasks.find(t => t.get('isRunning') == true);
  }),

  /**
   * is the editor blocked or is any plugin running
   * @property allBusy
   * @type boolean
   * @protected
   */
  allBusy: and('editorBusy', 'anyPluginBusy'),

  /**
   * Total number of plugins available
   * @property pluginsCount
   * @type number
   * @readOny
   */
  pluginsCount: length('tasks'),

  /**
   * Number of plugins that are currently running or scheduled to run
   * @property busyPluginsCount
   * @type number
   * @protected
   */
  busyPluginsCount: computed('tasks.@each.isRunning', function(){
    return this.tasks.filter(t => t.get('isRunning') == true).length;
  }),

  /**
   * Plugins that are currently running or scheduled to run
   * @property runningPlugins
   * @type Array
   * @protected
   */
  runningPlugins: computed('tasks.@each.isRunning', function(){
    return this.get('rdfaEditorDispatcher.pluginServices').filter(p => p.get('execute.isRunning') == true);
  })
});
