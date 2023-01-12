import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class EditorComponentsSlot extends Component<{
  contentDOM: HTMLElement;
  inline: boolean;
}> {
  @action
  didInsert(slotElement: HTMLElement) {
    slotElement.appendChild(this.args.contentDOM);
  }
}
