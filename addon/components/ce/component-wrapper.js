import Component from '@ember/component';
import layout from '../../../templates/components/ce/component-wrapper';
import { computed } from '@ember/object';
export default Component.extend({
  layout,
  classNames:['internal-component'],
  jsonContent: computed('content', function(){
    if (this.content)
      return JSON.stringify(this.content);
    else
      return '';
  }),
  attributeBindings: ['name:data-contenteditable-cw-name', 'jsonContent:data-contenteditable-cw-content', 'id:data-contenteditable-cw-id'],
  actions: {
    close() {
      this.removeComponent(this.id);
    },
    contentUpdate(content) {
      this.set('content',content);
      this.notifyPropertyChange('content');
    }
  }
});
