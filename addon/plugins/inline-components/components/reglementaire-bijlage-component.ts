import {
  InlineComponent,
  Properties,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';

export interface ReglementaireBijlageProperties extends Properties {
  title?: string;
  bijlage?: string;
}

export default class ReglementaireBijlageInlineComponent extends InlineComponent {
  constructor() {
    super('inline-components/example-inline-component', 'div');
  }
}
