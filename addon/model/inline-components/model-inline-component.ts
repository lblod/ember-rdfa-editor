import { tracked } from 'tracked-built-ins';
import Controller from '../controller';
import { DomNodeMatcher } from '../mark';
import ModelElement from '../model-element';
import { ModelNodeType } from '../model-node';
import { AttributeSpec, Serializable } from '../util/render-spec';

export type Properties = Record<string, Serializable | undefined | null>;
export abstract class InlineComponentSpec {
  name: string;
  tag: keyof HTMLElementTagNameMap;
  abstract properties: Record<
    string,
    { serializable: boolean; defaultValue?: Serializable | null }
  >;

  abstract matcher: DomNodeMatcher<AttributeSpec>;
  controller: Controller;

  constructor(
    name: string,
    tag: keyof HTMLElementTagNameMap,
    controller: Controller
  ) {
    this.name = name;
    this.tag = tag;
    this.controller = controller;
  }

  abstract _renderStatic(props?: Properties): string;
}

function render(spec: InlineComponentSpec, props?: Properties, dynamic = true) {
  const node = document.createElement(spec.tag);

  if (props) {
    const serializedProps: Record<string, Serializable | null | undefined> = {};
    for (const [propName, { serializable, defaultValue }] of Object.entries(
      spec.properties
    )) {
      if (serializable) {
        serializedProps[propName] = props[propName] ?? defaultValue;
      }
    }
    node.dataset['props'] = JSON.stringify(serializedProps);
  }
  node.contentEditable = 'false';
  node.classList.add('inline-component', spec.name);
  if (!dynamic) {
    node.innerHTML = spec._renderStatic(props);
  }
  return node;
}

export class ModelInlineComponent extends ModelElement {
  modelNodeType: ModelNodeType = 'INLINE-COMPONENT';
  private _spec: InlineComponentSpec;
  private _props: Properties;

  constructor(spec: InlineComponentSpec, props: Properties) {
    super(spec.tag);
    this._spec = spec;
    this._props = tracked(props);
  }

  get props() {
    return this._props;
  }

  setProperty(property: string, value: Serializable) {
    this._props = tracked({ ...this.props, [property]: value });
  }

  getProperty(property: string) {
    if (property in this.props) {
      return this.props[property];
    } else {
      return this.spec.properties[property]?.defaultValue;
    }
  }

  get spec() {
    return this._spec;
  }
  write(dynamic = true): Node {
    return render(this.spec, this.props, dynamic);
  }

  clone(): ModelInlineComponent {
    const result = new ModelInlineComponent(this.spec, this.props);
    return result;
  }

  get isLeaf() {
    return true;
  }
}
