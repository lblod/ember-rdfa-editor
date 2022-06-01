import {
  InlineComponentSpec,
  Properties,
  State,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { RenderSpec } from '@lblod/ember-rdfa-editor/model/util/render-spec';

export interface CounterState extends State {
  count: number;
}

export default class CounterSpec extends InlineComponentSpec {
  constructor() {
    super('inline-components/counter', 'span');
  }
  _renderStatic(_props?: Properties, state?: State): RenderSpec {
    const count = state?.count.toString() || '0';
    return { tag: 'p', children: [count] };
  }
}
