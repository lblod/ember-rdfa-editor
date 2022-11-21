import { MarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import {
  RenderSpec,
  SLOT,
} from '@lblod/ember-rdfa-editor/model/util/render-spec';

export const subscriptMarkSpec: MarkSpec = {
  matchers: [{ tag: 'sub' }],
  name: 'subscript',
  priority: 100,
  renderSpec(): RenderSpec {
    return {
      tag: 'sub',
      children: [SLOT],
    };
  },
};
