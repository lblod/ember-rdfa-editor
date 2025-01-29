import Component from '@glimmer/component';
import type { ComponentLike } from '@glint/template';
import '#root/styles/ember-rdfa-editor.scss';

const PILL_SIZES = ['small'] as const;

type PillComponentArgs = {
  skin?:
    | 'border'
    | 'action'
    | 'ongoing'
    | 'link'
    | 'success'
    | 'warning'
    | 'error';
  size?: (typeof PILL_SIZES)[number];
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
