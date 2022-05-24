import {
  InlineComponent,
  Properties,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { RenderSpec } from '@lblod/ember-rdfa-editor/model/util/render-spec';

export interface ReglementaireBijlageProperties extends Properties {
  title?: string;
  bijlage?: string;
}

export default class ReglementaireBijlageInlineComponent extends InlineComponent<ReglementaireBijlageProperties> {
  constructor() {
    super('reglementaire-bijlage-inline-component', 'div');
  }

  click() {
    console.log('test');
  }

  render(props?: ReglementaireBijlageProperties): RenderSpec {
    return {
      tag: this.tag,
      children: [
        { tag: 'span', children: [props?.title || ''] },
        { tag: 'button', children: ['button'] },
      ],
    };
  }
}
