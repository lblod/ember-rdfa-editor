import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import AuPanel from '@appuniversum/ember-appuniversum/components/au-panel';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';

type Signature = {
  Args: {
    node: ResolvedPNode;
  };
};

export default class DebugInfo extends Component<Signature> {
  @tracked collapsed = false;

  get pos() {
    return this.args.node.pos;
  }

  get nodeType() {
    return this.args.node.value.type.name;
  }

  toggleSection = () => {
    this.collapsed = !this.collapsed;
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
              @icon={{if this.collapsed ChevronDownIcon ChevronUpIcon}}
              {{on "click" this.toggleSection}}
            />
          </Group>
        </AuToolbar>
      </Section>
      {{#unless this.collapsed}}
        <Section>
          <p><strong>Position: </strong>{{this.pos}}</p>
          <p><strong>Nodetype: </strong>{{this.nodeType}}</p>
        </Section>
      {{/unless}}
    </AuPanel>
  </template>
}
