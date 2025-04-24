import AuButton, {
  type AuButtonSignature,
} from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { on } from '@ember/modifier/on';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import LinkRdfaNodeModal, {
  type PredicateOptionGenerator,
  type SubjectOptionGenerator,
  type SubmissionBody,
} from './modal.gts';
import { sayDataFactory } from '#root/core/say-data-factory/data-factory.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type SayController from '#root/core/say-controller.ts';
import { isRdfaAttrs } from '#root/core/rdfa-types.ts';
import { addBacklinkToNode } from '#root/utils/rdfa-utils.ts';
import type { IncomingTriple } from '#root/core/rdfa-processor.ts';
import t from 'ember-intl/helpers/t';

type LinkRdfaNodeButtonSig = {
  Element: AuButtonSignature['Element'];
  Args: {
    controller: SayController;
    node: ResolvedPNode;
    predicateOptionGenerator: PredicateOptionGenerator;
    subjectOptionGenerator: SubjectOptionGenerator;
  };
};
export default class LinkRdfaNodeButton extends Component<LinkRdfaNodeButtonSig> {
  @tracked modalOpen = false;

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  openModal = () => {
    this.modalOpen = true;
  };

  onFormSubmit = (body: SubmissionBody) => {
    const backlink: IncomingTriple = {
      subject: body.subject,
      predicate: body.predicate.value,
    };
    this.controller.withTransaction(
      () => {
        return addBacklinkToNode({
          rdfaId: this.node.value.attrs['__rdfaId'] as string,
          backlink,
        })(this.controller.mainEditorState).transaction;
      },
      { view: this.controller.mainEditorView },
    );
    this.modalOpen = false;
  };

  onFormCancel = () => {
    this.modalOpen = false;
  };

  get selectedObject() {
    const node = this.args.node;
    if (!isRdfaAttrs(node.value.attrs)) {
      throw new Error(`Expected node with pos ${node.pos} to be rdfa-aware`);
    }
    if (node.value.attrs.rdfaNodeType === 'resource') {
      return sayDataFactory.resourceNode(node.value.attrs.subject);
    } else {
      return sayDataFactory.literalNode(node.value.attrs.__rdfaId);
    }
  }

  <template>
    <AuButton
      @icon={{AddIcon}}
      @iconAlignment="left"
      @skin="link"
      {{on "click" this.openModal}}
      ...attributes
    >
      {{t "ember-rdfa-editor.linking-ui-poc.button.label"}}
    </AuButton>
    {{#if this.modalOpen}}
      <LinkRdfaNodeModal
        @selectedObject={{this.selectedObject}}
        @onSubmit={{this.onFormSubmit}}
        @onCancel={{this.onFormCancel}}
        @predicateOptionGenerator={{@predicateOptionGenerator}}
        @subjectOptionGenerator={{@subjectOptionGenerator}}
      />
    {{/if}}
  </template>
}
