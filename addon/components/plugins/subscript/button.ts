import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor';

type Args = {
  controller: ProseController;
};
export default class SubscriptButton extends Component<Args> {
  get controller() {
    return this.args.controller;
  }
  get isActive() {
    return this.controller.isMarkActive(
      this.controller.schema.marks.subscript,
      true
    );
  }

  @action
  toggle() {
    this.controller.toggleMark('subscript', true);
  }
}
