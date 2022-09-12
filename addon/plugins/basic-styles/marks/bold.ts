import { MarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import { RenderSpec, SLOT } from '@lblod/ember-rdfa-editor/utils/render-spec';

export const boldMarkSpec: MarkSpec = {
  matchers: [{ tag: 'b' }, { tag: 'strong' }],
  name: 'bold',
  priority: 100,
  renderSpec(): RenderSpec {
    return {
      tag: 'strong',
      children: [SLOT],
    };
  },
};
