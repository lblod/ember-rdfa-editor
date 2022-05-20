import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { RenderSpec } from '../../../model/util/render-spec';
import {
  InlineComponent,
  Properties,
} from '../../../model/inline-components/model-inline-component';

export interface ImageProperties extends Properties {
  imageSrc?: string;
}

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
  render(props: ImageProperties = {}): RenderSpec {
    return {
      tag: 'img',
      attributes: {
        src: props.imageSrc || '',
      },
    };
  },
};
