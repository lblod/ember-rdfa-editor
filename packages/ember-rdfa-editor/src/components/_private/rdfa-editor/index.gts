import Component from '@glimmer/component';
import { NodeSelection } from 'prosemirror-state';
import { localCopy } from 'tracked-toolbox';
import { isResourceNode } from '#root/utils/node-utils.ts';
import RdfaPropertyEditor from './property-editor/index.gts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import type SayController from '#root/core/say-controller.ts';
import BacklinkEditor from './backlink-editor/index.gts';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import type {
  ObjectOptionGenerator,
  PredicateOptionGenerator,
  SubjectOptionGenerator,
} from '#root/components/_private/rdfa-editor/relationship-editor/types.ts';

type Args = {
  controller: SayController;
  node: ResolvedPNode;
  additionalImportedResources?: string[];
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  predicateOptionGenerator?: PredicateOptionGenerator;
  subjectOptionGenerator?: SubjectOptionGenerator;
  objectOptionGenerator?: ObjectOptionGenerator;
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
          <AuHeading @level="1" @skin="6">RDFa</AuHeading>
          <AuPill>{{this.type}}</AuPill>
        </div>
      </c.header>
      <c.content>
        {{#if this.showPropertiesSection}}
          <RdfaPropertyEditor
            @node={{@node}}
            @controller={{this.controller}}
            @additionalImportedResources={{@additionalImportedResources}}
            @subjectOptionGenerator={{@subjectOptionGenerator}}
            @predicateOptionGenerator={{@predicateOptionGenerator}}
            @objectOptionGenerator={{@objectOptionGenerator}}
          />
        {{/if}}
        <BacklinkEditor
          @controller={{this.controller}}
          @node={{@node}}
          @subjectOptionGenerator={{@subjectOptionGenerator}}
          @predicateOptionGenerator={{@predicateOptionGenerator}}
          @objectOptionGenerator={{@objectOptionGenerator}}
        />
      </c.content>
    </AuCard>
  </template>
}
