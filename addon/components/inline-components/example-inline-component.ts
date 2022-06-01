import { action } from '@ember/object';
import {
  ExampleProps,
  ExampleState,
} from '@lblod/ember-rdfa-editor/plugins/inline-components/specs/example';
import InlineComponent from './inline-component';

export default class ExampleInlineComponent extends InlineComponent<
  ExampleProps,
  ExampleState
> {
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
