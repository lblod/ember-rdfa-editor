import {
  MarkSpec,
  RenderSpec,
  SLOT,
} from '@lblod/ember-rdfa-editor/model/mark';

export const italicMarkSpec: MarkSpec = {
  matchers: [{ tag: 'em' }, { tag: 'i' }],
  priority: 200,
  name: 'italic',
  renderSpec(): RenderSpec {
    return ['em', [SLOT]];
  },
};
