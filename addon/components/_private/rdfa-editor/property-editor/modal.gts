import Component from '@glimmer/component';
import type {
  ContentTriple,
  PlainTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import OutgoingTripleForm from '../outgoing-triple-form';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import WithUniqueId from '../../with-unique-id';
import { array } from '@ember/helper';
import { on } from '@ember/modifier';
import type { SupportedTermType } from '../external-triple-form';

interface Sig {
  Args: {
    property?: PlainTriple | ContentTriple;
    onCancel: () => void;
    onSave: (property: PlainTriple | ContentTriple) => void;
    modalOpen: boolean;
    title?: string;
    termTypes: SupportedTermType[];
  };
}

export default class PropertyEditorModal extends Component<Sig> {
  cancel = () => {
    this.args.onCancel();
  };

  save = (triple: PlainTriple) => {
    this.args.onSave(triple);
  };
  get title() {
    return this.args.title ?? 'Edit';
  }
  <template>
    <WithUniqueId as |formId|>
      <AuModal
        @modalOpen={{@modalOpen}}
        @closable={{true}}
        @closeModal={{this.cancel}}
      >
        <:title>{{this.title}}</:title>
        <:body>
          <OutgoingTripleForm
            id={{formId}}
            @onSubmit={{this.save}}
            @termTypes={{(array 'NamedNode' 'Literal' 'ContentLiteral')}}
            @triple={{@property}}
          />
        </:body>
        <:footer>
          <AuButtonGroup>
            <AuButton form={{formId}} type='submit'>Save</AuButton>
            <AuButton
              @skin='secondary'
              {{on 'click' this.cancel}}
            >Cancel</AuButton>
          </AuButtonGroup>
        </:footer>
      </AuModal>
    </WithUniqueId>
  </template>
}
