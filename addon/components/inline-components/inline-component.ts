import Component from '@glimmer/component';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import {
  ModelInlineComponent,
  Properties,
  State,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { Serializable } from '@lblod/ember-rdfa-editor/model/util/render-spec';

interface Args<A extends Properties = Properties, S extends State = State> {
  model: ModelInlineComponent<A, S>;
  node: HTMLElement;
  controller: Controller;
}

export default class InlineComponent<
  A extends Properties = Properties,
  S extends State = State
> extends Component<Args<A, S>> {
  get props() {
    return this.args.model.props;
  }

  get state() {
    return this.args.model.state;
  }

  setStateProperty(property: keyof S, value: Serializable) {
    this.args.model.setStateProperty(property, value);
    this.args.node.dataset['__state'] = JSON.stringify(this.args.model.state);
  }

  getStateProperty(property: keyof S) {
    return this.args.model.getStateProperty(property);
  }
}
