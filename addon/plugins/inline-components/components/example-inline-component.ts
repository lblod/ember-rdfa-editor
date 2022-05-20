import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { RenderSpec, SLOT } from '../../../model/util/render-spec';
import { InlineComponent } from '../../../model/inline-components/model-inline-component';

export const exampleInlineComponent: InlineComponent = {
  name: 'example-inline-component',
  matchers: [
    {
      tag: 'div',
      attributeBuilder: (node) => {
        if (isElement(node)) {
          if (node.classList.contains('inline-component')) {
            return {};
          }
        }
        return null;
      },
    },
  ],
  renderSpec(): RenderSpec {
    return {
      tag: 'div',
      attributes: {
        style: 'background-color:red;padding:10px;',
      },
      children: [
        { tag: 'h1', children: [SLOT] },
        { tag: 'h2', content: 'content' },
      ],
    };
  },
};
