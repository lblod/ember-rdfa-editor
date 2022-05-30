import { Serializable } from '../../../model/util/render-spec';
import { InlineComponent } from '../../../model/inline-components/model-inline-component';

export interface ExampleProperties
  extends Record<string, Serializable | undefined> {
  headLine?: string;
  content?: string;
}

export default class ExampleInlineComponent extends InlineComponent {
  constructor() {
    super('inline-components/example-inline-component', 'div');
  }
}
