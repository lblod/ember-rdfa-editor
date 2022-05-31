import Component from '@glimmer/component';

export default class InlineComponentsRegulatoryAttachment extends Component {
  get title() {
    return 'Example Regulatory Attachment';
  }

  get articles() {
    return [1, 2, 3, 4, 5, 6, 7].map((i) => `Article ${i}`);
  }
}
