import { action } from '@ember/object';
import { Properties } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import InlineComponent from './inline-component';

interface Props extends Properties {
  title: string;
  content: string;
}
export default class ExampleInlineComponent extends InlineComponent<Props> {
  @action
  click() {
    this.setStateProperty('contentVisible', !this.contentVisible);
  }

  get contentVisible() {
    return this.getStateProperty('contentVisible') || false;
  }
  get title() {
    return this.props.title;
  }

  get content() {
    return this.props.content;
  }
}
