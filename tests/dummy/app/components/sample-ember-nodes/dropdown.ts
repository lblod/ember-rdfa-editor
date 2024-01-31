import Component from '@glimmer/component';
import type { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';

export default class InlineComponentsPluginDropdown extends Component<EmberNodeArgs> {
  get title() {
    return 'Example Dropdown';
  }

  get articles() {
    return [1, 2, 3, 4, 5, 6, 7].map((i) => `Article ${i}`);
  }
}
