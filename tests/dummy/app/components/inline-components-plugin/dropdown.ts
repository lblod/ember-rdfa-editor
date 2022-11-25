import Component from '@glimmer/component';
import { EmberInlineComponentArgs } from '@lblod/ember-rdfa-editor/core/prosemirror';

export default class InlineComponentsPluginDropdown extends Component<EmberInlineComponentArgs> {
  get title() {
    return 'Example Dropdown';
  }

  get articles() {
    return [1, 2, 3, 4, 5, 6, 7].map((i) => `Article ${i}`);
  }
}
