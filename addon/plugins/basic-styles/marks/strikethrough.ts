import { MarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import { RenderSpec, SLOT } from '@lblod/ember-rdfa-editor/utils/render-spec';

export const strikethroughMarkSpec: MarkSpec = {
  matchers: [{ tag: 's' }, { tag: 'del' }],
  priority: 400,
  name: 'strikethrough',
  renderSpec(): RenderSpec {
    return {
      tag: 'del',
      children: [SLOT],
    };
  },
};
