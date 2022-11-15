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
    // We need to ensure that the properties of the model are not overwritten by a read, in the new TEDI API this is no longer necessary
    const serializedProps: Record<string, Serializable | null | undefined> = {};
    for (const [propName, { serializable, defaultValue }] of Object.entries(
      this.model.spec.properties
    )) {
      if (serializable) {
        serializedProps[propName] = this.model.props[propName] ?? defaultValue;
      }
    }
    this._node.dataset['props'] = JSON.stringify(serializedProps);
  }

  getProperty(property: string) {
    return this._model.getProperty(property);
  }
}
