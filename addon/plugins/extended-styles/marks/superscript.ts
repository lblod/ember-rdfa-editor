import { MarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import {
  RenderSpec,
  SLOT,
} from '@lblod/ember-rdfa-editor/model/util/render-spec';

export const superscriptMarkSpec: MarkSpec = {
  matchers: [{ tag: 'sup' }],
  name: 'superscript',
  priority: 100,
  renderSpec(): RenderSpec {
    return {
      tag: 'sup',
      children: [SLOT],
    };
  },
};
