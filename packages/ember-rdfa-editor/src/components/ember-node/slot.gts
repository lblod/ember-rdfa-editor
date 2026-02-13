import { action } from '@ember/object';
// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import Component from '@glimmer/component';

export default class EmberNodeSlot extends Component<{
  contentDOM: HTMLElement;
}> {
  @action
  didInsert(slotElement: HTMLElement) {
    slotElement.appendChild(this.args.contentDOM);
  }

  <template>
    <div data-slot {{didInsert this.didInsert}}></div>
  </template>
}
