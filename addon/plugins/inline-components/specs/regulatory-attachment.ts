import {
  InlineComponentSpec,
  Properties,
  State,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { RenderSpec } from '@lblod/ember-rdfa-editor/model/util/render-spec';

export default class RegulatoryAttachmentSpec extends InlineComponentSpec {
  _renderStatic(props?: Properties, state?: State): string {
    return `
      <p>Regulatory Attachment</p>
    `;
  }
  constructor() {
    super('inline-components/regulatory-attachment', 'span');
  }
}
