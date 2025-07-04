import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { setBlockType } from '#root/commands/set-block-type.ts';
import type IntlService from 'ember-intl/services/intl';
import { CheckIcon } from '@appuniversum/ember-appuniversum/components/icons/check';
import { NavDownIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-down';
import type SayController from '#root/core/say-controller.ts';
import type { NodeType } from 'prosemirror-model';

type Args = {
  controller?: SayController;
  onActivate?: () => void;
};
export default class HeadingsMenu extends Component<Args> {
  CheckIcon = CheckIcon;
  NavDownIcon = NavDownIcon;

  @service declare intl: IntlService;
  levels = [1, 2, 3, 4, 5, 6];

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller?.schema;
  }

  get enabled() {
    return this.canEnableText || this.levels.some(this.canEnableHeading);
  }

  get currentStyle() {
    const currentLevel = this.levels.find(this.headingIsActive);
    if (currentLevel) {
      return `${this.intl.t('ember-rdfa-editor.heading')} ${currentLevel}`;
    } else {
      return this.intl.t('ember-rdfa-editor.normalText');
    }
  }

  @action
  enableText() {
    if (this.schema) {
      this.enable(this.schema.nodes['paragraph']);
    }
  }

  @action
  enableHeading(level: number) {
    if (this.schema) {
      this.enable(this.schema.nodes['heading'], { level });
    }
  }

  @action
  enable(nodeType: NodeType, attrs?: Record<string, unknown>) {
    if (this.controller) {
      this.controller.doCommand(setBlockType(nodeType, attrs, true));
      this.args.onActivate?.();
    }
  }

  get canEnableText() {
    if (this.schema) {
      return this.canEnable(this.schema.nodes['paragraph']);
    } else {
      return false;
    }
  }

  canEnableHeading = (level: number) => {
    if (this.schema) {
      return this.canEnable(this.schema.nodes['heading'], { level });
    } else {
      return false;
    }
  };

  canEnable = (nodeType: NodeType, attrs?: Record<string, unknown>) => {
    return (
      !this.isActive(nodeType, attrs) &&
      this.controller?.checkCommand(setBlockType(nodeType, attrs, true))
    );
  };

  get textIsActive() {
    if (this.schema) {
      return this.isActive(this.schema.nodes['paragraph']);
    } else {
      return false;
    }
  }

  headingIsActive = (level: number) => {
    if (this.schema) {
      return this.isActive(this.schema.nodes['heading'], { level });
    } else {
      return false;
    }
  };

  isActive = (nodeType: NodeType, attrs: Record<string, unknown> = {}) => {
    if (this.controller) {
      const { selection } = this.controller.mainEditorState;
      const { $from, to } = selection;
      return (
        to <= $from.end() &&
        $from.parent.type === nodeType &&
        Object.keys(attrs).every(
          (key) => $from.parent.attrs[key] === attrs[key],
        )
      );
    } else {
      return false;
    }
  };
}
