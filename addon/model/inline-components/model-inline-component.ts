import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { DomNodeMatcher } from '../mark';
import ModelElement from '../model-element';
import { ModelNodeType } from '../model-node';
import renderFromSpec, { AttributeSpec, RenderSpec } from '../util/render-spec';

export interface InlineComponent {
  name: string;
  matchers: DomNodeMatcher<AttributeSpec>[];

  renderSpec(component: ModelInlineComponent): RenderSpec;
}

export class ModelInlineComponent extends ModelElement {
  modelNodeType: ModelNodeType = 'INLINE-COMPONENT';
  private _spec: InlineComponent;

  constructor(spec: InlineComponent) {
    super();
    this._spec = spec;
  }

  get spec() {
    return this._spec;
  }

  write(block: Node): Node | null {
    const rendered = renderFromSpec(this._spec.renderSpec(this), block);
    if (rendered && isElement(rendered)) {
      rendered.classList.add('inline-component');
    }
    return rendered;
  }
}
