import {
  InlineComponentSpec,
  Properties,
  State,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { RenderSpec } from '@lblod/ember-rdfa-editor/model/util/render-spec';

export default class ExampleSpec extends InlineComponentSpec {
  constructor() {
    super('inline-components/example-inline-component', 'span');
  }
  _renderStatic(_props?: Properties, _state?: State): RenderSpec {
    return { tag: 'p', children: ['test'] };
  }
}
