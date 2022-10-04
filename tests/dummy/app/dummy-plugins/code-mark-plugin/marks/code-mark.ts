import { MarkSpec } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import { RenderSpec, SLOT } from '@lblod/ember-rdfa-editor/utils/render-spec';

export const codeMarkSpec: MarkSpec = {
  matchers: [{ tag: 'code' }],
  name: 'code-mark',
  priority: 100,
  renderSpec(): RenderSpec {
    return {
      tag: 'code',
      children: [SLOT],
    };
  },
};
