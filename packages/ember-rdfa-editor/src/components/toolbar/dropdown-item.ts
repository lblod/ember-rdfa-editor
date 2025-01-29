import Component from '@glimmer/component';
import { action } from '@ember/object';

interface Args {
  menuAction?: () => void;
  onActivate?: (event: MouseEvent) => void;
}

export default class DropdownItem extends Component<Args> {
  @action
  activateMenuItem(event: MouseEvent) {
    event.preventDefault();
    this.args.menuAction?.();
    this.args.onActivate?.(event);
  }
}
