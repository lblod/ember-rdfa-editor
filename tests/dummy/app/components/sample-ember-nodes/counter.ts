import { action } from '@ember/object';
import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';

export default class InlineComponentsPluginCounter extends Component<EmberNodeArgs> {
  @action
  click() {
    this.args.updateAttribute('count', this.count + 1);
  }

  get count() {
    return this.args.node.attrs.count as number;
  }

  get label() {
    if (this.args.controller.documentLanguage.startsWith('nl')) {
      return 'Verhoog';
    } else {
      return 'Increase';
    }
  }
}
