import Component from '@glimmer/component';
import { localCopy } from 'tracked-toolbox';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import type SayController from '#root/core/say-controller.ts';
import { type RdfaVisualizerConfig } from '#root/plugins/rdfa-info/types.ts';
import RdfaExplorer from './rdfa-explorer.gts';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';

interface Sig {
  Args: {
    controller?: SayController;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    config: RdfaVisualizerConfig;
  };
}
export default class VisualiserCard extends Component<Sig> {
  @localCopy('args.expanded', true) declare expanded: boolean;

  toggleSection = () => {
    this.expanded = !this.expanded;
    this.args.onToggle?.(this.expanded);
  };

  <template>
    {{#if @controller}}
      <AuCard
        @size="small"
        @expandable={{true}}
        @manualControl={{true}}
        @openSection={{this.toggleSection}}
        @isExpanded={{this.expanded}}
        @disableAuContent={{true}}
        as |c|
      >
        <c.header>
          <AuHeading @level="1" @skin="6">RDFa visualiser</AuHeading>
        </c.header>
        <c.content class="au-c-content--tiny">
          <RdfaExplorer @controller={{@controller}} @config={{@config}} />
        </c.content>
      </AuCard>
    {{/if}}
  </template>
}
