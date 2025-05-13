import Component from '@glimmer/component';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { localCopy } from 'tracked-toolbox';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import type SayController from '#root/core/say-controller.ts';
import WrappingUtils from './wrapping-utils.gts';
import RemoveNodeButton from './remove-node.gts';

type Signature = {
  Args: {
    controller: SayController;
    node?: ResolvedPNode;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
  };
};

export default class NodeControlsCard extends Component<Signature> {
  @localCopy('args.expanded', true) declare expanded: boolean;

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
        <AuHeading @level="5" @skin="5">Node controls</AuHeading>
      </c.header>
      <c.content class="au-c-content--small">
        <WrappingUtils @controller={{@controller}} />
        {{#if @node}}
          <RemoveNodeButton @node={{@node}} @controller={{@controller}} />
        {{/if}}
      </c.content>
    </AuCard>
  </template>
}
