import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { MarkType } from 'prosemirror-model';
import { type ComponentLike } from '@glint/template';
import { toggleMarkAddFirst } from '@lblod/ember-rdfa-editor/commands';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller: SayController;
  mark: string;
  icon: ComponentLike;
  title: string;
};
export default class MarkComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get mark(): MarkType | undefined {
    if (this.controller && !this.controller.schema.marks[this.args.mark]) {
      console.error(
        `Can't find mark '${this.args.mark}', did you add it to your schema?`,
      );
    }
    return this.controller.schema.marks[this.args.mark];
  }

  get isActive() {
    return this.mark && this.controller.isMarkActive(this.mark);
  }

  get canToggle() {
    return (
      this.mark && this.controller.checkCommand(toggleMarkAddFirst(this.mark))
    );
  }

  @action
  toggle() {
    if (this.mark) {
      this.controller.focus();
      this.controller.doCommand(toggleMarkAddFirst(this.mark));
    }
  }
}
