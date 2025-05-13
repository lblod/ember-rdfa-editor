import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { localCopy } from 'tracked-toolbox';
import { eq, or } from 'ember-truth-helpers';
import { type PNode } from '#root/prosemirror-aliases.ts';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import { ChevronRightIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-right';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import type SayController from '#root/core/say-controller.ts';
import { selectNodeBySubject } from '#root/commands/_private/rdfa-commands/index.ts';
import { getNodesBySubject } from '#root/utils/rdfa-utils.ts';
import ConfigurableRdfaDisplay, {
  predicateDisplay,
} from '#root/components/_private/common/configurable-rdfa-display.gts';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';
import { ExternalLinkIcon } from '@appuniversum/ember-appuniversum/components/icons/external-link';
import PropertyDetails from '../rdfa-editor/property-details.gts';
import type {
  DisplayGenerator,
  RdfaVisualizerConfig,
} from '#root/plugins/rdfa-info/types.ts';
import { get } from '@ember/helper';

const backupResourceDisplay: DisplayGenerator<PNode> = (node) => {
  const subject = node.attrs['subject'] as string;
  return [subject];
};

export interface ResourceInfoSig {
  Args: {
    controller: SayController;
    subject: string;
    // In theory this could be used for optimisation but currently it is not...
    node?: PNode;
    expanded?: boolean;
    displayConfig: RdfaVisualizerConfig['displayConfig'];
  };
}

export default class ResourceInfo extends Component<ResourceInfoSig> {
  @localCopy('args.localCopy') expanded = false;

  get node(): PNode | undefined {
    return (
      this.args.node ??
      getNodesBySubject(
        this.args.controller.mainEditorState,
        this.args.subject,
      )[0]?.value
    );
  }
  get nodeProps() {
    return (this.node?.attrs['properties'] as OutgoingTriple[]) ?? [];
  }

  toggleExpanded = () => {
    this.expanded = !this.expanded;
  };

  goToSubject = (subject: string) => {
    this.args.controller.doCommand(selectNodeBySubject({ subject }), {
      view: this.args.controller.mainEditorView,
    });
    this.args.controller.focus();
  };

  <template>
    <div>
      <AuButton
        @skin="link"
        @hideText={{true}}
        @icon={{if this.expanded ChevronUpIcon ChevronRightIcon}}
        {{on "click" this.toggleExpanded}}
      >Toggle</AuButton>
      {{#if this.node}}
        <ConfigurableRdfaDisplay
          @value={{this.node}}
          @generator={{or @displayConfig.ResourceNode backupResourceDisplay}}
          @controller={{@controller}}
        />
        <AuButton
          @hideText={{true}}
          @icon={{ExternalLinkIcon}}
          @skin="link"
          {{on "click" (fn this.goToSubject @subject)}}
        >
          Go to subject
        </AuButton>
        {{#if this.expanded}}
          <AuList class="au-u-margin-left" @divider={{true}} as |Item|>
            {{#each this.nodeProps as |prop|}}
              <Item class="au-u-padding-tiny">
                <ConfigurableRdfaDisplay
                  @value={{prop}}
                  @generator={{or @displayConfig.predicate predicateDisplay}}
                  @controller={{@controller}}
                />
                {{#if (eq prop.object.termType "ResourceNode")}}
                  <ResourceInfo
                    @controller={{@controller}}
                    @subject={{prop.object.value}}
                    @displayConfig={{@displayConfig}}
                  />
                {{else if (get @displayConfig prop.object.termType)}}
                  <ResourceInfo
                    @controller={{@controller}}
                    @subject={{prop.object.value}}
                    {{! @glint-expect-error}}
                    @displayConfig={{get @displayConfig prop.object.termType}}
                  />
                {{else}}
                  <PropertyDetails @prop={{prop}} @controller={{@controller}} />
                {{/if}}
              </Item>
            {{else}}
              <p class="au-u-muted">No properties</p>
            {{/each}}
          </AuList>
        {{/if}}
      {{else}}
        {{@subject}}
      {{/if}}
    </div>
  </template>
}
