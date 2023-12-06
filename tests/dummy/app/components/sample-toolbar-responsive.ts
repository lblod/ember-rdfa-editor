import Component from '@glimmer/component';
import DocumentInfoPill from '@lblod/ember-rdfa-editor/components/_private/doc-editor/info-pill';
import DocumentLanguagePill from '@lblod/ember-rdfa-editor/components/_private/doc-editor/lang-pill';

export default class SampleToolbarResponsive extends Component {
  DocumentLanguagePill = DocumentLanguagePill;
  DocumentInfoPill = DocumentInfoPill;
}
