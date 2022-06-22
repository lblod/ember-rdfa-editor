import { MarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import {
  RenderSpec,
  SLOT,
} from '@lblod/ember-rdfa-editor/model/util/render-spec';

export const underlineMarkSpec: MarkSpec = {
  matchers: [{ tag: 'u' }],
  priority: 300,
  name: 'underline',
  renderSpec(): RenderSpec {
    return {
      tag: 'u',
      children: [SLOT],
    };
  },
};
