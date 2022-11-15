import Controller from '../controller';
import { Serializable } from '../util/render-spec';
import { ModelInlineComponent } from './model-inline-component';

export interface InlineComponentArgs {
  componentController: InlineComponentController;
  editorController: Controller;
}

export default class InlineComponentController {
  private _model: ModelInlineComponent;
  private _node: HTMLElement;

  constructor(model: ModelInlineComponent, node: HTMLElement) {
    this._model = model;
    this._node = node;
  }
  get props() {
    return this._model.props;
  }

  get model() {
    return this._model;
  }

  setProperty(property: string, value: Serializable) {
    this._model.setProperty(property, value);
    // this._node.dataset['props'] = JSON.stringify(this._model.props);
  }

  getProperty(property: string) {
    return this._model.getProperty(property);
  }
}
