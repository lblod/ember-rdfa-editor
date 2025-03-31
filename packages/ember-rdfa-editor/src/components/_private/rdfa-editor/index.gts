import Component from '@glimmer/component';
import { isResourceNode } from '#root/utils/node-utils.ts';
import { on } from '@ember/modifier';
import RdfaPropertyEditor from './property-editor/index.gts';
import RdfaWrappingUtils from './wrapping-utils/index.gts';
import RemoveNode from './remove-node/index.gts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import AuPanel from '@appuniversum/ember-appuniversum/components/au-panel';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import type SayController from '#root/core/say-controller.ts';
import { NodeSelection } from 'prosemirror-state';
import { localCopy } from 'tracked-toolbox';
import ExternalTripleEditor from './external-triple-editor/index.gts';
import BacklinkEditor from './backlink-editor/index.gts';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
  additionalImportedResources?: string[];
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
};
export default class RdfaEditor extends Component<Args> {
  @localCopy('args.expanded', true) declare expanded: boolean;

  toggleSection = () => {
    this.expanded = !this.expanded;
    this.args.onToggle?.(this.expanded);
  };

  get isResourceNode() {
    return isResourceNode(this.args.node.value);
  }

  get type() {
    if (this.args.node.value.type === this.controller?.schema.nodes['doc']) {
      return 'document';
    }
    return this.isResourceNode ? 'resource' : 'literal';
  }

  get controller() {
    return this.args.controller;
  }

  get showPropertiesSection() {
    return (
      this.controller &&
      (this.isResourceNode || this.args.node.value.type.name === 'doc')
    );
  }

  get hasSelection() {
    const selection = this.controller?.activeEditorState.selection;
    return selection && !selection.empty;
  }

  goToNodeWithId = (id: string) => {
    if (this.controller) {
      const doc = this.controller.mainEditorState.doc;
      let found = false;
      let resultPos = 0;
      doc.descendants((node, pos) => {
        if (found) return false;
        if (node.attrs['__rdfaId'] === id) {
          found = true;
          resultPos = pos;
          return false;
        }
        return true;
      });
      if (found) {
        this.controller.withTransaction((tr) => {
          return tr
            .setSelection(new NodeSelection(tr.doc.resolve(resultPos)))
            .scrollIntoView();
        });
      }
    }
  };
  <template>
    <AuPanel class="au-u-margin-bottom-tiny" as |Section|>
      <Section>
        <AuToolbar as |Group|>
          <Group>
            <AuHeading @level="4" @skin="4">RDFa</AuHeading>
          </Group>
          {{#if @node}}
            <Group>
              <AuPill>{{this.type}}</AuPill>
              <AuButton
                @skin="naked"
                @icon={{if this.expanded ChevronUpIcon ChevronDownIcon}}
                {{on "click" this.toggleSection}}
              />
            </Group>
          {{/if}}
        </AuToolbar>
      </Section>
      {{#if this.controller}}
        {{#if @node}}
          {{#if this.expanded}}
            {{#if this.showPropertiesSection}}
              <Section>
                <ExternalTripleEditor
                  @controller={{this.controller}}
                  @node={{@node}}
                />
              </Section>
              <Section>
                <RdfaPropertyEditor
                  @node={{@node}}
                  @controller={{this.controller}}
                />
              </Section>
            {{/if}}
            <Section>
              <BacklinkEditor @controller={{this.controller}} @node={{@node}} />
            </Section>
            <Section>
              <RdfaWrappingUtils @node={{@node}} @controller={{@controller}} />
            </Section>
            <Section>
              {{#if @controller}}
                <RemoveNode @node={{@node}} @controller={{@controller}} />
              {{/if}}
            </Section>
          {{/if}}
        {{else}}
          <Section>
            <RdfaWrappingUtils @node={{@node}} @controller={{@controller}} />
          </Section>
        {{/if}}
      {{/if}}
    </AuPanel>
  </template>
}
