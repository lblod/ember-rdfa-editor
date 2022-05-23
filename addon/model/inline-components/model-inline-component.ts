import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { DomNodeMatcher } from '../mark';
import ModelElement from '../model-element';
import { ModelNodeType } from '../model-node';
import renderFromSpec, { AttributeSpec, RenderSpec } from '../util/render-spec';

export type Properties = {
  [index: string]: string | undefined;
};
export abstract class InlineComponent {
  name: string;
  tag: keyof HTMLElementTagNameMap;

  baseMatcher: DomNodeMatcher<AttributeSpec>;
  matchers?: DomNodeMatcher<AttributeSpec>[];

  constructor(name: string, tag: keyof HTMLElementTagNameMap) {
    this.name = name;
    this.tag = tag;
    this.baseMatcher = {
      tag,
      attributeBuilder: (node) => {
        if (isElement(node)) {
          if (
            node.classList.contains('inline-component') &&
            node.classList.contains(this.name)
          ) {
            return {};
          }
        }
        return null;
      },
    };
  }

  abstract render(props?: Properties): RenderSpec;
}

export class ModelInlineComponent extends ModelElement {
  modelNodeType: ModelNodeType = 'INLINE-COMPONENT';
  private _spec: InlineComponent;
  private _props;

  constructor(
    spec: InlineComponent,
    attributes: Map<string, string> = new Map(),
    props: Properties = {}
  ) {
    super();
    this._spec = spec;
    this.attributeMap = attributes;
    this._props = props;
  }

  get spec() {
    return this._spec;
  }
  write(block?: Node): Node | null {
    if (block && isElement(block)) {
      block.setAttribute('contenteditable', 'true');
    }
    const rendered = renderFromSpec(this._spec.render(this._props), block);
    if (rendered && isElement(rendered)) {
      rendered.classList.add('inline-component', this._spec.name);
      rendered.setAttribute('contenteditable', 'false');
      this.attributeMap.forEach((val, key) => {
        rendered.setAttribute(key, val);
      });
    }
    return rendered;
  }
}
