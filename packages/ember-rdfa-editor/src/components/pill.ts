import Component from '@glimmer/component';
import type { ComponentLike } from '@glint/template';

type PILL_SIZES = 'small';

type PillComponentArgs = {
  skin?:
    | 'border'
    | 'action'
    | 'ongoing'
    | 'link'
    | 'success'
    | 'warning'
    | 'error';
  size?: PILL_SIZES;
  iconAlignment?: 'left' | 'right';
  icon?: ComponentLike;
};

export default class PillComponent extends Component<PillComponentArgs> {
  get skin() {
    if (this.args.skin) {
      return `au-c-pill--${this.args.skin}`;
    }

    return 'au-c-pill--default';
  }

  get size() {
    if (!this.args.size) {
      return '';
    }

    return `au-c-pill--${this.args.size}`;
  }

  get iconAlignment(): PillComponentArgs['iconAlignment'] {
    return this.args.iconAlignment ?? 'left';
  }
}
