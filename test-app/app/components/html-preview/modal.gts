import type { TOC } from '@ember/component/template-only';
import { on } from '@ember/modifier';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';

type Signature = {
  Args: {
    onClose: () => void;
    open?: boolean;
    doc: string;
  };
};
const HTMLPreviewModal: TOC<Signature> = <template>
  {{! FIXME fix the copy-pasted things }}
  <AuModal
    class="say-html-editor-modal"
    @title="HTML Editor"
    @closable={{true}}
    @closeModal={{@onClose}}
    @modalOpen={{@open}}
    @size="large"
    @padding="none"
  >
    <:title>Preview</:title>
    <:body>

      <iframe title="preview" height="100%" width="100%" srcdoc={{@doc}} />
    </:body>
    <:footer>
      <AuButtonGroup>
        <AuButton @skin="secondary" {{on "click" @onClose}}>
          Close
        </AuButton>
      </AuButtonGroup>
    </:footer>
  </AuModal>
</template>;

export default HTMLPreviewModal;
