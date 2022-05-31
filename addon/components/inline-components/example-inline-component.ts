import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ExampleInlineComponent extends Component {
  @tracked contentVisible = false;
  @action
  click() {
    this.contentVisible = !this.contentVisible;
    console.log('click');
  }
}
