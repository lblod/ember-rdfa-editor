import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuList, {
  type AuListSignature,
} from '@appuniversum/ember-appuniversum/components/au-list';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { RemoveIcon } from '@appuniversum/ember-appuniversum/components/icons/remove';
import { on } from '@ember/modifier';

import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';

type CollapsibleSignature = {
  Args: {
    expandedInitially?: boolean;
    title: string;
  };
  Element: HTMLDivElement;
  Blocks: {
    default: AuListSignature['Blocks']['default'];
  };
};
export default class Collapsible extends Component<CollapsibleSignature> {
  @tracked _expanded?: boolean;

  get expanded() {
    return this._expanded ?? this.args.expandedInitially;
  }

  @action
  toggle() {
    this._expanded = !this.expanded;
  }

  <template>
    <div class="say-editor-hints__insert">
      <div
        class="au-c-accordion au-c-accordion--reverse au-c-accordion--border"
      >
        <AuToolbar
          @nowrap={{true}}
          @reverse={{true}}
          {{on "click" this.toggle}}
          as |Group|
        >
          <Group>
            <div>
              <AuButton
                @skin="link"
                aria-hidden="true"
                focusable="false"
                aria-expanded="{{if this.expanded 'true' 'false'}}"
              >
                {{@title}}
              </AuButton>
            </div>
          </Group>
          <Group>
            {{#if this.expanded}}
              <AuIcon
                @icon={{RemoveIcon}}
                @alignment="left"
                @size="large"
                @ariaHidden="true"
              />
              <span class="au-u-hidden-visually">
                Open accordion
              </span>
            {{else}}
              <AuIcon
                @icon={{AddIcon}}
                @alignment="left"
                @size="large"
                @ariaHidden="true"
              />
              <span class="au-u-hidden-visually">
                Sluit accordion
              </span>
            {{/if}}
          </Group>
        </AuToolbar>
        <div class={{if this.expanded "au-c-accordion__content" "au-u-hidden"}}>
          <AuList @divider={{true}} as |Item|>
            {{yield Item}}
          </AuList>
        </div>
      </div>
    </div>
  </template>
}
