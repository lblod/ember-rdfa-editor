import {
  MarkSpec,
  RenderSpec,
  SLOT,
} from '@lblod/ember-rdfa-editor/model/mark';

export const underlineMarkSpec: MarkSpec = {
  matchers: [{ tag: 'u' }],
  priority: 300,
  name: 'underline',
  renderSpec(): RenderSpec {
    return ['u', [SLOT]];
  },
};
