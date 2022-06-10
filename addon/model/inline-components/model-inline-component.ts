import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import Handlebars from 'handlebars';
import { tracked } from 'tracked-built-ins';
import Controller from '../controller';
import { DomNodeMatcher } from '../mark';
import ModelElement from '../model-element';
import { ModelNodeType } from '../model-node';
import { AttributeSpec, RenderSpec, Serializable } from '../util/render-spec';

export type Properties = Record<string, Serializable | undefined>;

export type State = Record<string, Serializable | undefined>;
export abstract class InlineComponentSpec {
  name: string;
  tag: keyof HTMLElementTagNameMap;

  baseMatcher: DomNodeMatcher<AttributeSpec>;
  controller: Controller;

  constructor(
    name: string,
    tag: keyof HTMLElementTagNameMap,
    controller: Controller
  ) {
    this.name = name;
    this.tag = tag;
    this.controller = controller;
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

  _renderDynamic(props?: Properties, state?: State): RenderSpec {
    return {
      tag: this.tag,
      attributes: {
        'data-__props': JSON.stringify(props),
        'data-__state': JSON.stringify(state),
        contenteditable: false,
        class: `inline-component ${this.name}`,
      },
    };
  }

  abstract _renderStatic(props?: Properties, state?: State): string;

  render(props?: Properties, state?: State, dynamic = true) {
    const node = document.createElement(this.tag);
    if (props) {
      node.dataset['__props'] = JSON.stringify(props);
    }
    if (state) {
      node.dataset['__state'] = JSON.stringify(state);
    }
    node.contentEditable = 'false';
    node.classList.add('inline-component', this.name);
    if (!dynamic) {
      const template = Handlebars.compile(this._renderStatic(props, state));
      node.innerHTML = template({});
    }
    return node;
  }
}

export class ModelInlineComponent<
  A extends Properties = Properties,
  S extends State = State
> extends ModelElement {
  modelNodeType: ModelNodeType = 'INLINE-COMPONENT';
  private _spec: InlineComponentSpec;
  private _props: A;

  @tracked
  private _state: S;

  constructor(spec: InlineComponentSpec, props: A, state: S) {
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

  setStateProperty(property: keyof S, value: Serializable) {
    this._state = tracked({ ...this.state, [property]: value });
  }

  getStateProperty(property: keyof S) {
    if (property in this.state) {
      return this.state[property];
    } else {
      return null;
    }
  }

  get spec() {
    return this._spec;
  }
  write(dynamic = true): Node {
    return this.spec.render(this.props, this.state, dynamic);
  }

  clone(): ModelInlineComponent<A, S> {
    const result = new ModelInlineComponent(this.spec, this.props, this.state);
    return result;
  }
}
