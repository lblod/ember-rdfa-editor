import { get } from '@ember/object';
import classic from "ember-classic-decorator";
import { layout as templateLayout } from "@ember-decorators/component";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Component from '@ember/component';
import layout from '../../templates/components/rdfa/load-monitor';
import { mapBy, and } from '@ember/object/computed';

/**
 * Load monitor
 * @module rdfa-editor
 * @class RdfaEditorLoadMonitor
 * @construct
 */
@classic
@templateLayout(layout)
export default class LoadMonitor extends Component {
 /**
  * editor dispatcher
  * @property rdfaEditorDispatcher
  * @type {Service}
  * @private
  */

 /**
  * All services which have an async task
  * @property taskServices
  * @type array
  * @private
  */
 @computed('rdfaEditorDispatcher.pluginServices.[]')
 get taskServices(){
   const tasks = [];
   for ( const thing of this.rdfaEditorDispatcher.pluginServices || [] ) {
     if( get( thing, "execute.perform") )
       tasks.push( thing );
   }

   return tasks;
 }

 /**
  * plugins available in the dispatcher
  * @property tasks
  * @type array
  * @protected
  */
 @mapBy('taskServices', 'execute')
 tasks;

 /**
  * is the editor working
  * @property editorBusy
  * @type boolean
  * @protected
  */
 @computed('editor.generateDiffEvents.isRunning')
 get editorBusy() {
   if(!this.controller) return true;
   return this.controller.generateDiffEvents.isRunning === true;
 }

 /**
  * is any plugin scheduled or running
  * @property anyPluginBusy
  * @type boolean
  * @protected
  */
 @computed('tasks.@each.isRunning')
 get anyPluginBusy() {
   return this.tasks.find(t => get( t, 'isRunning') == true);
 }

 /**
  * is the editor blocked or is any plugin running
  * @property allBusy
  * @type boolean
  * @protected
  */
 @and('editorBusy', 'anyPluginBusy')
 allBusy;

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
 @computed('tasks.@each.isRunning')
 get busyPluginsCount() {
   return this.tasks.filter(t => get( t, 'isRunning') == true).length;
 }

 /**
  * Plugins that are currently running or scheduled to run
  * @property runningPlugins
  * @type Array
  * @protected
  */
 @computed('tasks.@each.isRunning', 'rdfaEditorDispatcher.pluginServices')
 get runningPlugins() {
   return this.rdfaEditorDispatcher.pluginServices.filter(p => p.get('execute.isRunning') === true);
 }
}
