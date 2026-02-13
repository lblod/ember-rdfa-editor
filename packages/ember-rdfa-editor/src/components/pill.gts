import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import Component from '@glimmer/component';
import type { ComponentLike } from '@glint/template';
import { eq, notEq } from 'ember-truth-helpers';

const PILL_SIZES = ['small'] as const;

type PillComponentSignature = {
  Element: HTMLSpanElement;
  Args: {
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
    icon?: ComponentLike<{ Element: Element }>;
  };
  Blocks: {
    default: [];
  };
};

export default class PillComponent extends Component<PillComponentSignature> {
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

  get iconAlignment(): PillComponentSignature['Args']['iconAlignment'] {
    return this.args.iconAlignment ?? 'left';
  }

  <template>
    <span class="au-c-pill {{this.skin}} {{this.size}}" ...attributes>
      {{#if @icon}}
        {{#if (notEq @iconAlignment "right")}}
          <AuIcon @icon={{@icon}} />
        {{/if}}
      {{/if}}
      {{yield}}
      {{#if @icon}}
        {{#if (eq @iconAlignment "right")}}
          <AuIcon @icon={{@icon}} />
        {{/if}}
      {{/if}}
    </span>
  </template>
}
