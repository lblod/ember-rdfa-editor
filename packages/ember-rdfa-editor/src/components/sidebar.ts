import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SidebarComponent extends Component {
  @tracked expanded = false;

  @action
  toggle() {
    this.expanded = !this.expanded;
  }
}
