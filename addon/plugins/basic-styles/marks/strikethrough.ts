import {
  MarkSpec,
  RenderSpec,
  SLOT,
} from '@lblod/ember-rdfa-editor/model/mark';

export const strikethroughMarkSpec: MarkSpec = {
  matchers: [{ tag: 's' }, { tag: 'del' }],
  priority: 400,
  name: 'strikethrough',
  renderSpec(): RenderSpec {
    return ['del', [SLOT]];
  },
};
