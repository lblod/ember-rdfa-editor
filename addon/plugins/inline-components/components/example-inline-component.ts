import { RenderSpec } from '../../../model/util/render-spec';
import {
  InlineComponent,
  Properties,
} from '../../../model/inline-components/model-inline-component';

export interface ExampleProperties extends Properties {
  headLine?: string;
  content?: string;
}

export default class ExampleInlineComponent extends InlineComponent {
  constructor() {
    super('example-inline-component', 'div');
  }
  render(props: ExampleProperties = {}): RenderSpec {
    return {
      tag: this.tag,
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
  }
}
