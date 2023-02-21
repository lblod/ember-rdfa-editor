import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class EmberNodeSlot extends Component<{
  contentDOM: HTMLElement;
}> {
  @action
  didInsert(slotElement: HTMLElement) {
    slotElement.appendChild(this.args.contentDOM);
  }
}
