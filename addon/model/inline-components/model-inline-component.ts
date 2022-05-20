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

  constructor(
    spec: InlineComponent,
    attributes: Map<string, string> = new Map()
  ) {
    super();
    this._spec = spec;
    this.attributeMap = attributes;
  }

  get spec() {
    return this._spec;
  }
  write(block?: Node): Node | null {
    if (block && isElement(block)) {
      block.setAttribute('content-editable', 'true');
    }
    const rendered = renderFromSpec(this._spec.renderSpec(this), block);
    if (rendered && isElement(rendered)) {
      rendered.classList.add('inline-component');
      rendered.setAttribute('content-editable', 'false');
      this.attributeMap.forEach((val, key) => {
        rendered.setAttribute(key, val);
      });
    }
    return rendered;
  }
}
