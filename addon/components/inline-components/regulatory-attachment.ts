import { Properties } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import InlineComponent from './inline-component';

export default class InlineComponentsRegulatoryAttachment extends InlineComponent<Properties> {
  get title() {
    return 'Example Regulatory Attachment';
  }

  get articles() {
    return [1, 2, 3, 4, 5, 6, 7].map((i) => `Article ${i}`);
  }
}
