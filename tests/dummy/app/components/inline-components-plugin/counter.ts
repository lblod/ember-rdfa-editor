import { action } from '@ember/object';
import Component from '@glimmer/component';
import { EmberInlineComponentArgs } from '@lblod/ember-rdfa-editor/core/prosemirror';

export default class InlineComponentsPluginCounter extends Component<EmberInlineComponentArgs> {
  @action
  click() {
    this.args.updateAttribute('count', this.count + 1);
  }

  get count() {
    return this.args.node.attrs.count as number;
  }
}
