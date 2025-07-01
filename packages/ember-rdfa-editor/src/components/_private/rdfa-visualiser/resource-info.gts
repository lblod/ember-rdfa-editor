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
import PropertyDetails from '#root/components/_private/common/property-details.gts';
import type {
  DisplayGenerator,
  GeneratorContext,
  RdfaVisualizerConfig,
} from '#root/plugins/rdfa-info/types.ts';
import { get } from '@ember/helper';
import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type { TOC } from '@ember/component/template-only';
import type { ComponentLike } from '@glint/template';

const Div: TemplateOnlyComponent<{
  Element: HTMLDivElement;
  Blocks: { default: [] };
}> = <template>
  <div ...attributes>{{yield}}</div>
</template>;

const backupResourceDisplay: DisplayGenerator<PNode> = (node) => {
  const subject = node.attrs['subject'] as string;
  return [subject];
};

const ResourceNodeWrapper: TOC<{
  Element: HTMLElement;
  Args: {
    expanded?: boolean;
    onToggle: (event: MouseEvent) => void;
    wrapper?: ComponentLike<{ Blocks: { default: [] } }>;
  };
  Blocks: { default: [] };
}> = <template>
  {{#if @wrapper}}
    <@wrapper>
      <div ...attributes>
        <AuButton
          @skin="link"
          @hideText={{true}}
          @icon={{if @expanded ChevronUpIcon ChevronRightIcon}}
          {{on "click" @onToggle}}
        >Toggle</AuButton>
        {{yield}}
      </div>
    </@wrapper>
  {{else}}
    <div ...attributes>
      <AuButton
        @skin="link"
        @hideText={{true}}
        @icon={{if @expanded ChevronUpIcon ChevronRightIcon}}
        {{on "click" @onToggle}}
      >Toggle</AuButton>
      {{yield}}
    </div>
  {{/if}}
</template>;

export interface ResourceInfoSig {
  Args: {
    controller: SayController;
    subject: string;
    isTopLevel: boolean;
    // In theory this could be used for optimisation but currently it is not...
    node?: PNode;
    expanded?: boolean;
    displayConfig: RdfaVisualizerConfig['displayConfig'];
    wrapper?: ComponentLike<{ Blocks: { default: [] } }>;
  };
}

export default class ResourceInfo extends Component<ResourceInfoSig> {
  @localCopy('args.expanded') expanded = false;

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

  generatorContext = (isTopLevel: boolean): GeneratorContext => ({
    controller: this.args.controller,
    isTopLevel,
  });

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
    {{#if this.node}}
      <ConfigurableRdfaDisplay
        @value={{this.node}}
        @generator={{or @displayConfig.ResourceNode backupResourceDisplay}}
        @context={{this.generatorContext @isTopLevel}}
        @wrapper={{component
          ResourceNodeWrapper
          expanded=this.expanded
          onToggle=this.toggleExpanded
          wrapper=@wrapper
        }}
      >
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
              <ConfigurableRdfaDisplay
                @value={{prop}}
                @generator={{or @displayConfig.predicate predicateDisplay}}
                @context={{this.generatorContext false}}
                @wrapper={{Item}}
              >
                {{#if (eq prop.object.termType "ResourceNode")}}
                  <ResourceInfo
                    @controller={{@controller}}
                    @subject={{prop.object.value}}
                    @isTopLevel={{false}}
                    @displayConfig={{@displayConfig}}
                  />
                {{else if (get @displayConfig prop.object.termType)}}
                  <ConfigurableRdfaDisplay
                    @wrapper={{Div}}
                    @value={{prop}}
                    {{! @glint-expect-error }}
                    @generator={{get @displayConfig prop.object.termType}}
                    @context={{this.generatorContext false}}
                  />
                {{else}}
                  <PropertyDetails @prop={{prop}} @controller={{@controller}} />
                {{/if}}
              </ConfigurableRdfaDisplay>
            {{else}}
              <p class="au-u-muted">No properties</p>
            {{/each}}
          </AuList>
        {{/if}}
      </ConfigurableRdfaDisplay>
    {{else}}
      {{#if @wrapper}}
        <@wrapper>
          <div>
            {{@subject}}
          </div>
        </@wrapper>
      {{else}}
        <div>
          {{@subject}}
        </div>
      {{/if}}
    {{/if}}
  </template>
}
