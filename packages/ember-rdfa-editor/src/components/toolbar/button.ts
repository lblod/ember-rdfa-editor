import Component from '@glimmer/component';
import type { ComponentLike } from '@glint/template';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import type SayController from '#root/core/say-controller.ts';

interface Sig {
  Args: {
    // TODO Ideally this would be required if an options block is passed, but I don't think that's
    // possible within the glint type system, so maybe this needs to be refactored
    controller?: SayController;
    icon: ComponentLike;
    optionsIcon?: ComponentLike;
    optionsLabel?: string;
    active?: boolean;
    disabled?: boolean;
    title?: string;
  };
  Element: HTMLButtonElement;
  Blocks: {
    default: [];
    // TODO Improve the types for the options block
    options: [{ Item: ComponentLike }];
  };
}

export default class ToolbarButton extends Component<Sig> {
  get optionsIcon() {
    return this.args.optionsIcon ?? ChevronDownIcon;
  }
}
