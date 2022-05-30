import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { DomNodeMatcher } from '../mark';
import ModelElement from '../model-element';
import { ModelNodeType } from '../model-node';
import { AttributeSpec, Serializable } from '../util/render-spec';

export type Properties = {
  [index: string]: Serializable | undefined;
};
export class InlineComponent {
  name: string;
  tag: keyof HTMLElementTagNameMap;

  baseMatcher: DomNodeMatcher<AttributeSpec>;

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

  render(props?: Properties) {
    const node = document.createElement(this.tag);
    if (props) {
      node.dataset['__props'] = JSON.stringify(props);
    }
    node.contentEditable = 'false';
    node.classList.add('inline-component', this.name);
    return node;
  }
}

export class ModelInlineComponent<A extends Properties> extends ModelElement {
  modelNodeType: ModelNodeType = 'INLINE-COMPONENT';
  private _spec: InlineComponent;
  private _props: A;

  constructor(spec: InlineComponent, props: A) {
    super();
    this._spec = spec;
    this._props = props;
  }

  get props() {
    return this._props;
  }

  get spec() {
    return this._spec;
  }
  write(): Node {
    return this.spec.render(this._props);
  }
}
