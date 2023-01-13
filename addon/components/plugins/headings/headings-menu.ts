import { action } from '@ember/object';
import Component from '@glimmer/component';
import {
  NodeType,
  ProseController,
  setBlockType,
} from '@lblod/ember-rdfa-editor';

type Args = {
  controller: ProseController;
};
export default class HeadingsMenu extends Component<Args> {
  levels = [1, 2, 3, 4, 5, 6];

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  enableText() {
    this.enable(this.schema.nodes.paragraph);
  }

  @action
  enableHeading(level: number) {
    this.enable(this.schema.nodes.heading, { level });
  }

  @action
  enable(nodeType: NodeType, attrs?: Record<string, unknown>) {
    this.controller.doCommand(setBlockType(nodeType, attrs));
  }

  get canEnableText() {
    return this.canEnable(this.schema.nodes.paragraph);
  }

  canEnableHeading = (level: number) => {
    return this.canEnable(this.schema.nodes.heading, { level });
  };

  canEnable = (nodeType: NodeType, attrs?: Record<string, unknown>) => {
    return (
      !this.isActive(nodeType, attrs) &&
      this.controller.checkCommand(setBlockType(nodeType, attrs))
    );
  };

  get textIsActive() {
    return this.isActive(this.schema.nodes.paragraph);
  }

  headingIsActive = (level: number) => {
    return this.isActive(this.schema.nodes.heading, { level });
  };

  isActive = (nodeType: NodeType, attrs: Record<string, unknown> = {}) => {
    const { selection } = this.controller.state;
    const { $from, to } = selection;
    return (
      to <= $from.end() &&
      $from.parent.type === nodeType &&
      Object.keys(attrs).every((key) => $from.parent.attrs[key] === attrs[key])
    );
  };
}
