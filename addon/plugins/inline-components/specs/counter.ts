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
  _renderStatic(_props?: Properties, state?: State): string {
    const count = state?.count.toString() || '0';
    return `
      <p>${count}</p>
    `;
  }
  constructor() {
    super('inline-components/counter', 'span');
  }
}
