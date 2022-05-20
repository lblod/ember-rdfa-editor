import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { RenderSpec } from '../../../model/util/render-spec';
import { InlineComponent } from '../../../model/inline-components/model-inline-component';

export const imageInlineComponent: InlineComponent = {
  name: 'image-inline-component',
  matchers: [
    {
      tag: 'img',
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
    return [
      {
        tag: 'img',
        attributes: {
          src: 'https://emberjs.com/images/tomsters/a11y-tomster750w-2137b8b891485dd920ccf5c0d5d1645d.png',
        },
      },
      [],
    ];
  },
};
