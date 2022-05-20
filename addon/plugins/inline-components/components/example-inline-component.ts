import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { RenderSpec } from '../../../model/util/render-spec';
import {
  InlineComponent,
  Properties,
} from '../../../model/inline-components/model-inline-component';
import { imageInlineComponent } from './image-inline-component';

export interface ExampleProperties extends Properties {
  headLine?: string;
  content?: string;
}
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
  render(props: ExampleProperties = {}): RenderSpec {
    return {
      tag: 'div',
      attributes: {
        style: 'border: 2px solid;padding:10px;width:60%;',
      },
      children: [
        { tag: 'h1', children: [props.headLine || ''] },
        { tag: 'hr', attributes: { style: 'border-top: 1px solid black;' } },
        { tag: 'h2', children: ['content'] },
        {
          tag: 'div',
          attributes: { style: 'overflow-y: scroll; height:150px;' },
          children: [props.content || ''],
        },
        imageInlineComponent.render({
          imageSrc:
            'https://emberjs.com/images/tomsters/a11y-tomster750w-2137b8b891485dd920ccf5c0d5d1645d.png',
        }),
        imageInlineComponent.render({
          imageSrc:
            'https://emberjs.com/images/tomsters/tomster750w-64ed66ab3d6aaa63ed0538b9cf958dbb.png',
        }),
      ],
    };
  },
};
