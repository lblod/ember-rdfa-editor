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
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { addProperty } from '#root/commands/rdfa-commands/add-property.ts';
import type {
  OptionGeneratorConfig,
  RelationshipSubmissionBody,
} from './types.ts';
import RelationshipEditorDevModeModal from './modals/dev-mode.gts';
import RelationshipEditorClassicModal from './modals/classic.gts';

type CreateRelationshipButtonSig = {
  Element: AuButtonSignature['Element'];
  Args: {
    controller: SayController;
    node?: ResolvedPNode;
    optionGeneratorConfig?: OptionGeneratorConfig;
    devMode?: boolean;
  };
};
export default class CreateRelationshipButton extends Component<CreateRelationshipButtonSig> {
  @tracked modalOpen = false;

  get controller() {
    return this.args.controller;
  }

  openModal = () => {
    this.modalOpen = true;
  };
  closeModal = () => {
    this.modalOpen = false;
  };

  onFormSubmit = (body: RelationshipSubmissionBody) => {
    if (!this.args.node) {
      return;
    }
    const node = this.args.node;
    const { predicate, target } = body;
    if (predicate.direction === 'property') {
      const property = {
        predicate: predicate.term.value,
        object: target.term,
      };
      this.controller.doCommand(
        addProperty({
          resource: node.value.attrs['subject'] as string,
          // @ts-expect-error fix type of property
          property,
        }),
      );
    } else if (predicate.direction === 'backlink') {
      const backlink = {
        subject: target.term,
        predicate: predicate.term.value,
      };
      this.controller.withTransaction(
        () => {
          return addBacklinkToNode({
            rdfaId: node.value.attrs['__rdfaId'] as string,
            // @ts-expect-error fix type of backlink
            backlink,
          })(this.controller.mainEditorState).transaction;
        },
        { view: this.controller.mainEditorView },
      );
    }

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
      {{#if this.selectedNode}}
        {{#if @devMode}}
          <RelationshipEditorDevModeModal
            @source={{this.selectedNode}}
            @onSubmit={{this.onFormSubmit}}
            @onCancel={{this.closeModal}}
            @optionGeneratorConfig={{@optionGeneratorConfig}}
          />
        {{else}}
          <RelationshipEditorClassicModal
            @source={{this.selectedNode}}
            @onSubmit={{this.onFormSubmit}}
            @onCancel={{this.closeModal}}
            @optionGeneratorConfig={{@optionGeneratorConfig}}
          />
        {{/if}}
      {{/if}}
    {{/if}}
  </template>
}
