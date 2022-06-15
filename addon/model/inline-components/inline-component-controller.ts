import Controller from '../controller';
import { Serializable } from '../util/render-spec';
import {
  ModelInlineComponent,
  Properties,
  State,
} from './model-inline-component';

export interface InlineComponentArgs<
  A extends Properties = Properties,
  S extends State = State
> {
  componentController: InlineComponentController<A, S>;
  editorController: Controller;
}

export default class InlineComponentController<
  A extends Properties = Properties,
  S extends State = State
> {
  private _model: ModelInlineComponent<A, S>;
  private _node: HTMLElement;

  constructor(model: ModelInlineComponent<A, S>, node: HTMLElement) {
    this._model = model;
    this._node = node;
  }
  get props() {
    return this._model.props;
  }

  get state() {
    return this._model.state;
  }

  setStateProperty(property: keyof S, value: Serializable) {
    this._model.setStateProperty(property, value);
    this._node.dataset['__state'] = JSON.stringify(this._model.state);
  }

  getStateProperty(property: keyof S) {
    return this._model.getStateProperty(property);
  }
}
