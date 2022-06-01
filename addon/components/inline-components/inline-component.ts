import Component from '@glimmer/component';
import {
  ModelInlineComponent,
  Properties,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { Serializable } from '@lblod/ember-rdfa-editor/model/util/render-spec';

interface Args<A extends Properties> {
  model: ModelInlineComponent<A>;
  node: HTMLElement;
}

export default class InlineComponent<A extends Properties> extends Component<
  Args<A>
> {
  get props() {
    return this.args.model.props;
  }

  get state() {
    return this.args.model.state;
  }

  setStateProperty(property: string, value: Serializable) {
    this.args.model.setStateProperty(property, value);
    this.args.node.dataset['__state'] = JSON.stringify(this.args.model.state);
  }

  getStateProperty(property: string) {
    return this.args.model.getStateProperty(property);
  }
}
