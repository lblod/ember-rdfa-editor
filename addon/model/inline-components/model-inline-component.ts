import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { tracked } from 'tracked-built-ins';
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

export type State = {
  [index: string]: Serializable;
};
export abstract class InlineComponentSpec {
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

  abstract _renderStatic(props?: Properties, state?: State): RenderSpec;

  render(props?: Properties, state?: State, dynamic = true): RenderSpec {
    return {
      tag: this.tag,
      attributes: {
        'data-__props': JSON.stringify(props),
        'data-__state': JSON.stringify(state),
        contenteditable: false,
        class: `inline-component ${this.name}`,
      },
      children: dynamic ? undefined : [this._renderStatic(props, state)],
    };
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
    return renderFromSpec(this.spec.render(this.props, this.state, dynamic))!;
  }
}
