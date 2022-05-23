import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { RenderSpec } from '../../../model/util/render-spec';
import {
  InlineComponent,
  Properties,
} from '../../../model/inline-components/model-inline-component';

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
      ],
    };
  },
};
