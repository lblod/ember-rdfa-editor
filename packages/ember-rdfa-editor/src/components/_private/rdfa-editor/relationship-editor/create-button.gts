import AuButton, {
  type AuButtonSignature,
} from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { sayDataFactory } from '#root/core/say-data-factory/data-factory.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type SayController from '#root/core/say-controller.ts';
import { isRdfaAttrs } from '#root/core/rdfa-types.ts';
import { addBacklinkToNode } from '#root/utils/rdfa-utils.ts';
import type {
  IncomingTriple,
  OutgoingTriple,
} from '#root/core/rdfa-processor.ts';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { addProperty } from '#root/commands/rdfa-commands/add-property.ts';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import RelationshipEditorForm from './form.gts';
import RelationshipEditorDevForm from './form-dev-mode.gts';
import type { ObjectOptionGenerator, PredicateOptionGenerator, SubjectOptionGenerator, SubmissionBody } from './types.ts';


type CreateRelationshipButtonSig = {
  Element: AuButtonSignature['Element'];
  Args: {
    controller: SayController;
    node?: ResolvedPNode;
    predicateOptionGenerator: PredicateOptionGenerator;
    subjectOptionGenerator: SubjectOptionGenerator;
    objectOptionGenerator: ObjectOptionGenerator;
    devMode?: boolean;
  };
};
export default class CreateRelationshipButton extends Component<CreateRelationshipButtonSig> {
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
    if (!this.node) {
      return;
    }
    const node = this.node;
    const { predicate, target } = body;
    if (predicate.direction === 'property') {
      const property = {
        predicate: predicate.term.value,
        object: target.term,
      } as OutgoingTriple;
      this.controller.doCommand(
        addProperty({
          resource: this.node.value.attrs['subject'] as string,
          property,
        }),
      );
    } else if (predicate.direction === 'backlink') {
      const backlink = {
        subject: target.term,
        predicate: predicate.term.value,
      } as IncomingTriple;
      this.controller.withTransaction(
        () => {
          return addBacklinkToNode({
            rdfaId: node.value.attrs['__rdfaId'] as string,
            backlink,
          })(this.controller.mainEditorState).transaction;
        },
        { view: this.controller.mainEditorView },
      );
    }

    this.modalOpen = false;
  };

  closeModal = () => {
    this.modalOpen = false;
  };

  get selectedNode() {
    const node = this.args.node;
    if (!node || !isRdfaAttrs(node.value.attrs)) {
      return;
    }
    if (node.value.attrs.rdfaNodeType === 'resource') {
      return sayDataFactory.resourceNode(node.value.attrs.subject);
    } else {
      return sayDataFactory.literalNode(node.value.attrs.__rdfaId);
    }
  }

  get isDisabled() {
    return !this.selectedNode;
  }

  get FormComponent() {
    return this.args.devMode
      ? RelationshipEditorDevForm
      : RelationshipEditorForm;
  }

  <template>
    <AuButton
      @icon={{AddIcon}}
      @disabled={{this.isDisabled}}
      @iconAlignment="left"
      @skin="link"
      {{on "click" this.openModal}}
      ...attributes
    >
      {{t "ember-rdfa-editor.linking-ui-poc.button.label"}}
    </AuButton>
    {{#if this.modalOpen}}
      <AuModal @modalOpen={{true}} @closeModal={{this.closeModal}}>
        <:title>{{t "ember-rdfa-editor.linking-ui-poc.modal.title"}}</:title>
        <:body>
          <this.FormComponent
            {{! @glint-expect-error }}
            @source={{this.selectedNode}}
            @onSubmit={{this.onFormSubmit}}
            @onCancel={{this.closeModal}}
            @predicateOptionGenerator={{@predicateOptionGenerator}}
            @subjectOptionGenerator={{@subjectOptionGenerator}}
            @objectOptionGenerator={{@objectOptionGenerator}}
          />
        </:body>
      </AuModal>
    {{/if}}
  </template>
}
