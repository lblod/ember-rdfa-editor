import { and } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../templates/components/load-monitor';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { length, filter } from 'ember-awesome-macros/array';
import { mapBy } from '@ember/object/computed';

export default Component.extend({
  layout,
  rdfaEditorDispatcher: service(),

  tasks: mapBy('rdfaEditorDispatcher.pluginServices', 'execute'),

  editorBusy: computed('editor.generateDiffEvents.isRunning', function(){
    if(!this.editor) return true;
    return this.get('editor.generateDiffEvents.isRunning') == true;
  }),

  anyPluginBusy: computed('tasks.@each.isRunning', function(){
    return this.tasks.find(t => t.get('isRunning') == true);
  }),

  allBusy: and('editorBusy', 'anyPluginBusy'),

  pluginsCount: length('tasks'),

  busyPluginsCount: computed('tasks.@each.isRunning', function(){
    return this.tasks.filter(t => t.get('isRunning') == true).length;
  }),

  runningPlugins: computed('tasks.@each.isRunning', function(){
    return this.get('rdfaEditorDispatcher.pluginServices').filter(p => p.get('execute.isRunning') == true);
  })
});
