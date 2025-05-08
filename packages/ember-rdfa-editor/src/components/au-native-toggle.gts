import type { TOC } from '@ember/component/template-only';
import { and, not } from 'ember-truth-helpers';

type Signature = {
  Args: {
    identifier?: string;
    disabled?: boolean;
    name?: string;
    label?: string;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLInputElement;
};

const AuNativeToggle: TOC<Signature> = <template>
  <label
    for={{@identifier}}
    class="au-c-toggle-switch
      {{if
        (and (not (has-block)) (not @label))
        'au-c-toggle-switch--labelless'
      }}
      {{if @disabled 'is-disabled'}}"
    data-test-toggle-switch-label
  >
    <input
      type="checkbox"
      class="au-c-toggle-switch__input au-u-hidden-visually"
      id={{@identifier}}
      name={{@name}}
      disabled={{@disabled}}
      data-test-toggle-switch-input
      ...attributes
    />
    <span class="au-c-toggle-switch__toggle"></span>
    {{#if (has-block)}}
      {{yield}}
    {{/if}}
  </label>
</template>;

export default AuNativeToggle;
