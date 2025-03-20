import Component from '@glimmer/component';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types.ts';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import AuPanel from '@appuniversum/ember-appuniversum/components/au-panel';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { localCopy } from 'tracked-toolbox';

type Signature = {
  Args: {
    node: ResolvedPNode;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
  };
};

export default class DebugInfo extends Component<Signature> {
  @localCopy('args.expanded', true) declare expanded: boolean;

  get pos() {
    return this.args.node.pos;
  }

  get nodeType() {
    return this.args.node.value.type.name;
  }

  toggleSection = () => {
    this.expanded = !this.expanded;
    this.args.onToggle?.(this.expanded);
  };

  <template>
    <AuPanel class="au-u-margin-bottom-tiny" as |Section|>
      <Section>
        <AuToolbar as |Group|>
          <Group>
            <AuHeading @level="5" @skin="5">Debug Info</AuHeading>
          </Group>
          <Group>
            <AuButton
              @skin="naked"
              @icon={{if this.expanded ChevronUpIcon ChevronDownIcon}}
              {{on "click" this.toggleSection}}
            />
          </Group>
        </AuToolbar>
      </Section>
      {{#if this.expanded}}
        <Section>
          <p><strong>Position: </strong>{{this.pos}}</p>
          <p><strong>Nodetype: </strong>{{this.nodeType}}</p>
        </Section>
      {{/if}}
    </AuPanel>
  </template>
}
