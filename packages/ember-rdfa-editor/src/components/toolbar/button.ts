import Component from '@glimmer/component';
import type { ComponentLike } from '@glint/template';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';

type Args = {
  icon: ComponentLike;
  optionsIcon: ComponentLike;
};

export default class ToolbarButton extends Component<Args> {
  get optionsIcon() {
    return this.args.optionsIcon ?? ChevronDownIcon;
  }
}
