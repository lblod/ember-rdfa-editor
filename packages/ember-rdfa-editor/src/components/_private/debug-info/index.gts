import Component from '@glimmer/component';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { localCopy } from 'tracked-toolbox';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';

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
    <AuCard
      @size="small"
      @expandable={{true}}
      @manualControl={{true}}
      @openSection={{this.toggleSection}}
      @isExpanded={{this.expanded}}
      as |c|
    >
      <c.header>
        <AuHeading @level="1" @skin="6">Debug Info</AuHeading>
      </c.header>
      <c.content class="au-c-content--tiny">
        <p><strong>Position: </strong>{{this.pos}}</p>
        <p><strong>Nodetype: </strong>{{this.nodeType}}</p>
      </c.content>
    </AuCard>
  </template>
}
