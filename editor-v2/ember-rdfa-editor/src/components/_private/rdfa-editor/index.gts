import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { NodeSelection, SayController } from '#root';
import { isResourceNode } from '#root/utils/node-utils.ts';
import { on } from '@ember/modifier';
import RdfaPropertyEditor from './property-editor/index.ts';
import RdfaRelationshipEditor from './relationship-editor/index.gts';
import RdfaWrappingUtils from './wrapping-utils/index.ts';
import RemoveNode from './remove-node/index.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import AuPanel from '@appuniversum/ember-appuniversum/components/au-panel';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import ExternalTripleEditor from './external-triple-editor.gts';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
  additionalImportedResources?: string[];
};
export default class RdfaEditor extends Component<Args> {
  @tracked collapsed = false;

  toggleSection = () => {
    this.collapsed = !this.collapsed;
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
                @icon={{if this.collapsed ChevronDownIcon ChevronUpIcon}}
                {{on "click" this.toggleSection}}
              />
            </Group>
          {{/if}}
        </AuToolbar>
      </Section>
      {{#if this.controller}}
        {{#if @node}}
          {{#unless this.collapsed}}
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
                  @controller={{@controller}}
                />
              </Section>
            {{/if}}
            <Section>
              <RdfaRelationshipEditor
                @node={{@node}}
                @controller={{@controller}}
                @additionalImportedResources={{@additionalImportedResources}}
              />
            </Section>
            <Section>
              <RdfaWrappingUtils @node={{@node}} @controller={{@controller}} />
            </Section>
            <Section>
              {{#if @controller}}
                <RemoveNode @node={{@node}} @controller={{@controller}} />
              {{/if}}
            </Section>
          {{/unless}}
        {{else}}
          <Section>
            <RdfaWrappingUtils @node={{@node}} @controller={{@controller}} />
          </Section>
        {{/if}}
      {{/if}}
    </AuPanel>
  </template>
}
