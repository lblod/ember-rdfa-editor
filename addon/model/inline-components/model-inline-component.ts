import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { tracked } from 'tracked-built-ins';
import { DomNodeMatcher } from '../mark';
import ModelElement from '../model-element';
import { ModelNodeType } from '../model-node';
import { AttributeSpec, Serializable } from '../util/render-spec';

export type Properties = {
  [index: string]: Serializable | undefined;
};

export type State = {
  [index: string]: Serializable;
};
export class InlineComponentSpec {
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

  render(props?: Properties, state?: State) {
    const node = document.createElement(this.tag);
    if (props) {
      node.dataset['__props'] = JSON.stringify(props);
    }
    if (state) {
      node.dataset['__state'] = JSON.stringify(state);
    }
    node.contentEditable = 'false';
    node.classList.add('inline-component', this.name);
    return node;
  }
}

export class ModelInlineComponent<A extends Properties> extends ModelElement {
  modelNodeType: ModelNodeType = 'INLINE-COMPONENT';
  private _spec: InlineComponentSpec;
  private _props: A;

  @tracked
  private _state: State;

  constructor(spec: InlineComponentSpec, props: A, state: State = {}) {
    super(spec.tag);
    this._spec = spec;
    this._props = props;
    this._state = tracked(state);
  }

  get props() {
    return this._props;
  }

  get state() {
    return this._state;
  }

  setStateProperty(property: string, value: Serializable) {
    this._state = tracked({ ...this.state, [property]: value });
  }

  getStateProperty(property: string) {
    if (property in this.state) {
      return this.state[property];
    } else {
      return null;
    }
  }

  get spec() {
    return this._spec;
  }
  write(): Node {
    return this.spec.render(this.props, this.state);
  }
}
