import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class RdfaPluginWrapper extends Component {
  @tracked expanded = false;

  @action
  toggle() {
    this.expanded = !this.expanded;
  }
}
