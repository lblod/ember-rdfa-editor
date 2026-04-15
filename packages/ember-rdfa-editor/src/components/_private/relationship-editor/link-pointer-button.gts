import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { tracked } from 'tracked-built-ins';
import t from 'ember-intl/helpers/t';
import AuButton, {
  type AuButtonSignature,
} from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type SayController from '#root/core/say-controller.ts';
import { isRdfaAttrs } from '#root/core/rdfa-types.ts';
import {
  findNodeByRdfaId,
  findNodesBySubject,
} from '#root/utils/rdfa-utils.ts';
import type { OptionGeneratorConfig, SubmissionBody } from './types.ts';
import RelationshipEditorPointerModal from './modals/pointer.gts';

type LinkPointerButtonSig = {
  Element: AuButtonSignature['Element'];
  Args: {
    controller: SayController;
    node?: ResolvedPNode;
    optionGeneratorConfig?: OptionGeneratorConfig;
  };
};

export default class LinkPointerButton extends Component<LinkPointerButtonSig> {
  @tracked modalOpen = false;

  openModal = () => {
    this.modalOpen = true;
  };
  closeModal = () => {
    this.modalOpen = false;
  };

  onFormSubmit = (body: SubmissionBody) => {
    if (!this.args.node || !('pointerDirection' in body)) {
      return;
    }
    const node = this.args.node;
    const {
      target: { term: targetTerm },
    } = body;
    if (body.pointerDirection === 'property') {
      this.args.controller.withTransaction((tr, state) => {
        let sub;
        if (targetTerm.termType === 'ResourceNode') {
          sub = findNodesBySubject(state.doc, targetTerm.value)[0];
        } else {
          sub = findNodeByRdfaId(state.doc, targetTerm.value);
        }
        if (sub) {
          return tr.setNodeAttribute(sub.pos, 'pointed', targetTerm.value);
        }
        return tr;
      });
    } else if (body.pointerDirection === 'backlink') {
      this.args.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(node.pos, 'pointed', targetTerm.value);
      });
    }

    this.modalOpen = false;
  };

  get selectedNodeAttrs() {
    const node = this.args.node;
    if (!node || !isRdfaAttrs(node.value.attrs)) {
      return;
    }
    return node.value.attrs;
  }

  get isDisabled() {
    return !this.selectedNodeAttrs;
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
      {{t "ember-rdfa-editor.relationship-editor.pointer-linking.button"}}
    </AuButton>
    {{#if this.modalOpen}}
      {{#if this.selectedNodeAttrs}}
        <RelationshipEditorPointerModal
          @sourceAttrs={{this.selectedNodeAttrs}}
          @onSubmit={{this.onFormSubmit}}
          @onCancel={{this.closeModal}}
          @optionGeneratorConfig={{@optionGeneratorConfig}}
        />
      {{/if}}
    {{/if}}
  </template>
}
