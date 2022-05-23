import {
  InlineComponent,
  Properties,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { RenderSpec } from '@lblod/ember-rdfa-editor/model/util/render-spec';

export interface ReglementaireBijlageProperties extends Properties {
  title?: string;
  bijlage?: string;
}

export default class ReglementaireBijlageInlineComponent extends InlineComponent {
  constructor() {
    super('reglementaire-bijlage-inline-component', 'div');
  }

  render(props?: Properties): RenderSpec {
    return {
      tag: this.tag,
      children: [{ tag: 'h5', children: [props?.title || ''] }],
    };
  }
}
