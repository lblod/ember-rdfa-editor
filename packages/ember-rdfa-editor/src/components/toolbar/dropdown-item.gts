import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';

interface Signature {
  Args: {
    menuAction?: () => void;
    onActivate?: (event: MouseEvent) => void;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLButtonElement;
}

export default class DropdownItem extends Component<Signature> {
  @action
  activateMenuItem(event: MouseEvent) {
    event.preventDefault();
    this.args.menuAction?.();
    this.args.onActivate?.(event);
  }

  <template>
    <button
      role="menuitem"
      type="button"
      {{on "click" this.activateMenuItem}}
      ...attributes
    >
      {{yield}}
    </button>
  </template>
}
