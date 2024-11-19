import Component from '@glimmer/component';
import type SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import WithUniqueId from '../with-unique-id';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { on } from '@ember/modifier';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { tracked } from '@glimmer/tracking';
import type { FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import MetaTripleForm from './meta-triple-form';
import { transformMetaTriples } from '@lblod/ember-rdfa-editor/utils/meta-triple-utils';

interface EditModalSig {
  Args: {
    modalOpen: boolean;
    onCancel: () => void;
    onSubmit: (trip: FullTriple) => void;
  };
}
// TODO: fix as soon as we can import the TOC type
// eslint-disable-next-line ember/no-empty-glimmer-component-classes
class EditModal extends Component<EditModalSig> {
  <template>
    <WithUniqueId as |formId|>
      <AuModal
        @modalOpen={{@modalOpen}}
        @closable={{true}}
        @closeModal={{@onCancel}}
      >
        <:title>Edit meta triples</:title>
        <:body>
          <MetaTripleForm @onSubmit={{@onSubmit}} id={{formId}} />
        </:body>
        <:footer>
          <AuButtonGroup>
            <AuButton form={{formId}} type='submit'>Save</AuButton>
            <AuButton
              @skin='secondary'
              {{on 'click' @onCancel}}
            >Cancel</AuButton>
          </AuButtonGroup>
        </:footer>
      </AuModal>
    </WithUniqueId>
  </template>
}

interface Sig {
  Args: { controller: SayController; node: ResolvedPNode };
}
export default class MetaTripleEditor extends Component<Sig> {
  @tracked
  editModalOpen = false;
  get metaTriples() {
    return this.args.node.value.attrs['metaTriples'] ?? [];
  }
  get controller() {
    return this.args.controller;
  }
  closeModal = () => {
    this.editModalOpen = false;
  };
  updateMetaTriples = (trip: FullTriple) => {
    const tr = transformMetaTriples(
      (triples) => triples.concat(trip),
      this.args.node.pos,
    )(this.controller.mainEditorState).transaction;
    this.controller.mainEditorView.dispatch(tr);

    this.closeModal();
  };
  startTripleCreation = () => {
    this.editModalOpen = true;
  };
  <template>
    <AuContent @skin='tiny'>
      <AuToolbar as |Group|>
        <Group>
          <AuHeading @level='5' @skin='5'>MetaTriples</AuHeading>
        </Group>
        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @skin='naked'
            {{on 'click' this.startTripleCreation}}
          >
            Add triple
          </AuButton>
        </Group>
      </AuToolbar>
    </AuContent>
    <EditModal
      @modalOpen={{this.editModalOpen}}
      @onCancel={{this.closeModal}}
      @onSubmit={{this.updateMetaTriples}}
    />
  </template>
}
