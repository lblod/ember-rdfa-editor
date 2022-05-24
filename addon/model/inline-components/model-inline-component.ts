import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { DomNodeMatcher } from '../mark';
import ModelElement from '../model-element';
import { ModelNodeType } from '../model-node';
import renderFromSpec, {
  AttributeSpec,
  RenderSpec,
  Serializable,
} from '../util/render-spec';

export type Properties = {
  [index: string]: Serializable | undefined;
};
export abstract class InlineComponent<A extends Properties> {
  name: string;
  tag: keyof HTMLElementTagNameMap;

  baseMatcher: DomNodeMatcher<AttributeSpec>;
  matchers?: DomNodeMatcher<AttributeSpec>[];

  constructor(name: string, tag: keyof HTMLElementTagNameMap) {
    this.name = name;
    this.tag = tag;
    this.baseMatcher = {
      tag: this.tag,
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

  abstract render(props?: A): RenderSpec;
}

export class ModelInlineComponent<A extends Properties> extends ModelElement {
  modelNodeType: ModelNodeType = 'INLINE-COMPONENT';
  private _spec: InlineComponent<A>;
  private _props: A;

  constructor(spec: InlineComponent<A>, props: A) {
    super();
    this._spec = spec;
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
      rendered.dataset['__props'] = JSON.stringify(this._props);
      this.attributeMap.forEach((val, key) => {
        rendered.setAttribute(key, val);
      });
    }
    return rendered;
  }
}

export abstract class BaseComponent extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.render();
    }
  }

  getAttributeValue(attributeName: string) {
    return this.getAttribute(attributeName) || '';
  }

  abstract render(): string;
}
