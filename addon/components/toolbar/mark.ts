import { action } from '@ember/object';
import Component from '@glimmer/component';
import { toggleMarkAddFirst } from '@lblod/ember-rdfa-editor/commands';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller: SayController;
  mark: string;
};
export default class MarkComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get mark() {
    return this.controller.schema.marks[this.args.mark];
  }

  get isActive() {
    return this.controller.isMarkActive(this.mark);
  }

  get canToggle() {
    return this.controller.checkCommand(toggleMarkAddFirst(this.mark));
  }

  @action
  toggle() {
    this.controller.focus();
    this.controller.doCommand(toggleMarkAddFirst(this.mark));
  }
}
