import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';

export default class CollapsibleComponent extends Component {
  @tracked expanded = false;

  @action
  toggle() {
    this.expanded = !this.expanded;
  }
}
