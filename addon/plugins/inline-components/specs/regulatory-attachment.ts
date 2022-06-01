import { InlineComponentSpec } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';

export default class RegulatoryAttachmentSpec extends InlineComponentSpec {
  _renderStatic(): string {
    return `
      <p>Regulatory Attachment</p>
    `;
  }
  constructor() {
    super('inline-components/regulatory-attachment', 'span');
  }
}
