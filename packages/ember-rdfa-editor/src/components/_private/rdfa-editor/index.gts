import Component from '@glimmer/component';
import { NodeSelection } from 'prosemirror-state';
import { localCopy } from 'tracked-toolbox';
import { isResourceNode } from '#root/utils/node-utils.ts';
import RdfaPropertyEditor from './property-editor/index.gts';
import RdfaWrappingUtils from './wrapping-utils/index.gts';
import RemoveNode from './remove-node/index.gts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import type SayController from '#root/core/say-controller.ts';
import ExternalTripleEditor from './external-triple-editor/index.gts';
import BacklinkEditor from './backlink-editor/index.gts';
import { IMPORTED_RESOURCES_ATTR } from '#root/plugins/imported-resources/index.ts';
import DocImportedResourceEditor from './doc-imported-resource-editor/index.gts';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';

type Args = {
  controller: SayController;
  node: ResolvedPNode;
  additionalImportedResources?: string[];
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  propertyPredicates?: string[];
  propertyObjects?: string[];
  backlinkPredicates?: string[];
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

  get isDocWithImportedResources() {
    return (
      this.type === 'document' &&
      !!this.controller?.schema.nodes['doc']?.spec.attrs?.[
        IMPORTED_RESOURCES_ATTR
      ]
    );
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
    <AuCard
      @size="small"
      @expandable={{true}}
      @manualControl={{true}}
      @openSection={{this.toggleSection}}
      @isExpanded={{this.expanded}}
      as |c|
    >
      <c.header>
        <div
          class="au-u-flex au-u-flex--row au-u-flex--vertical-center au-u-flex--spaced-small"
        >
          <AuHeading @level="5" @skin="5">RDFa</AuHeading>
          <AuPill>{{this.type}}</AuPill>
        </div>
      </c.header>
      <c.content>
        {{#if this.isDocWithImportedResources}}
          <DocImportedResourceEditor
            @controller={{@controller}}
            @node={{@node}}
          />
        {{/if}}
        {{#if this.showPropertiesSection}}
          <ExternalTripleEditor
            @controller={{this.controller}}
            @node={{@node}}
          />
          <RdfaPropertyEditor
            @node={{@node}}
            @controller={{this.controller}}
            @additionalImportedResources={{@additionalImportedResources}}
            @predicateOptions={{@propertyPredicates}}
            @objectOptions={{@propertyObjects}}
          />
        {{/if}}
        <BacklinkEditor
          @controller={{this.controller}}
          @node={{@node}}
          @predicateOptions={{@backlinkPredicates}}
        />
        <RdfaWrappingUtils @node={{@node}} @controller={{@controller}} />
        <RemoveNode @node={{@node}} @controller={{@controller}} />
      </c.content>
    </AuCard>
  </template>
}
