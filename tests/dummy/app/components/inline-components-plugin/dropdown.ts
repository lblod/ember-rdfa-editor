import Component from '@glimmer/component';

export default class InlineComponentsPluginDropdown extends Component {
  get title() {
    return 'Example Dropdown';
  }

  get articles() {
    return [1, 2, 3, 4, 5, 6, 7].map((i) => `Article ${i}`);
  }
}
