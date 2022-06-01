import {
  InlineComponentSpec,
  Properties,
  State,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { RenderSpec } from '@lblod/ember-rdfa-editor/model/util/render-spec';

export interface ExampleProps extends Properties {
  title: string;
  content: string;
}

export interface ExampleState extends State {
  contentVisible: boolean;
}
export default class ExampleSpec extends InlineComponentSpec {
  constructor() {
    super('inline-components/example-inline-component', 'span');
  }
  _renderStatic(props?: ExampleProps, _state?: State): RenderSpec {
    return {
      tag: 'div',
      children: [
        { tag: 'h2', children: [props?.title || ''] },
        { tag: 'p', children: [props?.content || ''] },
      ],
    };
  }
}
