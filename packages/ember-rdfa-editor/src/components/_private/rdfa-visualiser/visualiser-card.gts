import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { localCopy } from 'tracked-toolbox';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import AuPanel from '@appuniversum/ember-appuniversum/components/au-panel';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import type SayController from '#root/core/say-controller.ts';
import { type ResolvedPNode } from '#root/utils/_private/types.ts';
import { type RdfaVisualizerConfig } from '#root/plugins/rdfa-info/types.ts';
import RdfaExplorer from './rdfa-explorer.gts';

interface Sig {
  Args: {
    controller?: SayController;
    node?: ResolvedPNode;
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
      <AuPanel
        class="au-u-margin-top-tiny au-u-margin-bottom-tiny"
        as |Section|
      >
        <Section>
          <AuToolbar as |Group|>
            <Group>
              <AuHeading @level="4" @skin="4">RDFa visualiser</AuHeading>
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
            <RdfaExplorer
              @controller={{@controller}}
              @node={{@node}}
              @config={{@config}}
            />
          </Section>
        {{/if}}
      </AuPanel>
    {{/if}}
  </template>
}
