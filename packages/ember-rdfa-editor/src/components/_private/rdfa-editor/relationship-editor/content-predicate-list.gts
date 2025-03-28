import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { OutgoingTriple } from '#root/core/rdfa-processor.ts';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';

interface Args {
  properties: OutgoingTriple[];
  removeProperty: (index: number) => void;
}
export default class ContentPredicateList extends Component<Args> {
  @tracked newPredicate = '';

  get contentPredicates() {
    return this.args.properties
      .map((prop, index) => ({ prop, index }))
      .filter((entry) => entry.prop.object.termType === 'ContentLiteral');
  }

  <template>
    <AuList @divider={{true}} as |Item|>
      {{#each this.contentPredicates as |entry|}}
        <Item
          class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
        >{{entry.prop.predicate}}
          <AuDropdown
            @icon={{ThreeDotsIcon}}
            role="menu"
            @alignment="left"
          >
            <AuButton
              @skin="link"
              @icon={{BinIcon}}
              role="menuitem"
              class="au-c-button--alert"
              {{on "click" (fn @removeProperty entry.index)}}
            >
              Remove content predicate
            </AuButton>
          </AuDropdown>
        </Item>
      {{/each}}
    </AuList>
  </template>
}
