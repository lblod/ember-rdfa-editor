import Component from '@glimmer/component';
import type SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { on } from '@ember/modifier';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import PropertyEditorModal from './property-editor/modal';
import { tracked } from '@glimmer/tracking';
import type { FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

interface Sig {
  Args: { controller: SayController; node: ResolvedPNode };
}
export default class MetaTripleEditor extends Component<Sig> {
  @tracked
  editModalOpen = false;
  get metaTriples() {
    return this.args.node.value.attrs['metaTriples'] ?? [];
  }
  closeModal = () => {
    this.editModalOpen = false;
  };
  updateMetaTriples = (property: FullTriple) => {
    this.closeModal();
  };
  startTripleCreation = () => {};
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
    <PropertyEditorModal
      @title='Edit meta-triple'
      @onCancel={{this.closeModal}}
      @onSave={{this.updateMetaTriples}}
      @modalOpen={{this.editModalOpen}}
    />
  </template>
}
