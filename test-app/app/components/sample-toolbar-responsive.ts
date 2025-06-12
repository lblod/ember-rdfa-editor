import Component from '@glimmer/component';
import type { SayController } from '@lblod/ember-rdfa-editor';
import DocumentInfoPill from '@lblod/ember-rdfa-editor/components/_private/doc-editor/info-pill';
import DocumentLanguagePill from '@lblod/ember-rdfa-editor/components/_private/doc-editor/lang-pill';
import FormatTextIcon from '@lblod/ember-rdfa-editor/components/icons/format-text';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';

interface Args {
  controller: SayController | undefined;
}
export default class SampleToolbarResponsive extends Component<Args> {
  DocumentLanguagePill = DocumentLanguagePill;
  DocumentInfoPill = DocumentInfoPill;
  FormatTextIcon = FormatTextIcon;
  PlusIcon = PlusIcon;
  ThreeDotsIcon = ThreeDotsIcon;
  get supportsTables() {
    return this.args.controller?.activeEditorState.schema.nodes['table_cell'];
  }
}
