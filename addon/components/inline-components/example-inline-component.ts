import { action } from '@ember/object';
import Component from '@glimmer/component';
import {
  ModelInlineComponent,
  Properties,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';

interface Props extends Properties {
  title: string;
  content: string;
}
interface Args {
  model: ModelInlineComponent<Props>;
}
export default class ExampleInlineComponent extends Component<Args> {
  // @tracked contentVisible = false;

  @action
  click() {
    this.model.setStateProperty('contentVisible', !this.contentVisible);
    console.log('click');
  }

  get contentVisible() {
    return this.model.getStateProperty('contentVisible') || false;
  }

  get model() {
    return this.args.model;
  }

  get title() {
    return this.model.props.title;
  }

  get content() {
    return this.model.props.content;
  }
}
