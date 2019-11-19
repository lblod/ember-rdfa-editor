import classic from "ember-classic-decorator";
import { classNames, attributeBindings, layout as templateLayout } from "@ember-decorators/component";
import { action, computed } from "@ember/object";
import Component from '@ember/component';
import layout from '../../templates/components/ce/component-wrapper';

@classic
@templateLayout(layout)
@classNames('internal-component')
@attributeBindings(
  'name:data-contenteditable-cw-name',
  'jsonContent:data-contenteditable-cw-content',
  'id:data-contenteditable-cw-id'
)
export default class ComponentWrapper extends Component {
  @computed('content')
  get jsonContent() {
    if (this.content)
      return JSON.stringify(this.content);
    else
      return '';
  }

  @action
  close() {
    this.removeComponent(this.id);
  }

  @action
  contentUpdate(content) {
    this.set('content',content);
    this.notifyPropertyChange('content');
  }
}
