import Component from '@glimmer/component';
import type { SayController } from '@lblod/ember-rdfa-editor';
import DocumentInfoPill from '@lblod/ember-rdfa-editor/components/_private/doc-editor/info-pill';
import DocumentLanguagePill from '@lblod/ember-rdfa-editor/components/_private/doc-editor/lang-pill';

interface Args {
  controller: SayController | undefined;
}
export default class SampleToolbarResponsive extends Component<Args> {
  DocumentLanguagePill = DocumentLanguagePill;
  DocumentInfoPill = DocumentInfoPill;
  get supportsTables() {
    return this.args.controller?.activeEditorState.schema.nodes['table_cell'];
  }
}
