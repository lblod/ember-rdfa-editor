import { action } from '@ember/object';
import { Properties } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import InlineComponent from './inline-component';

export default class InlineComponentsCounter extends InlineComponent<Properties> {
  @action
  click() {
    this.setStateProperty('count', this.count + 1);
  }

  get count(): number {
    return (this.getStateProperty('count') as number) || 0;
  }
}
