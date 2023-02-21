import { action } from '@ember/object';
import Component from '@glimmer/component';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller: SayController;
  mark: string;
};
export default class BoldComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get mark() {
    return this.controller.schema.marks[this.args.mark];
  }

  get isActive() {
    return this.controller.isMarkActive(this.mark);
  }

  @action
  toggle() {
    this.controller.toggleMark(this.mark);
  }
}
