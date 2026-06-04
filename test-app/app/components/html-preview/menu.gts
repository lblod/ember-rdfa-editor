import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { SayController } from '@lblod/ember-rdfa-editor';
import { generatePageForExport } from '@lblod/ember-rdfa-editor/utils/export-utils';
import ToolbarButton from '@lblod/ember-rdfa-editor/components/toolbar/button';
import HTMLPreviewModal from './modal.gts';

type Signature = {
  Args: {
    controller: SayController;
  };
};

export default class HTMLPreviewMenu extends Component<Signature> {
  @tracked previewOpen = false;

  get exportPreview() {
    return generatePageForExport(this.args.controller, false);
  }

  @action
  openPreview() {
    this.previewOpen = true;
  }
  @action
  closePreview() {
    this.previewOpen = false;
  }

  <template>
    <ToolbarButton
      {{on "click" this.openPreview}}
      class="au-u-margin-left-tiny au-u-margin-right-tiny"
    >
      Preview Rendered HTML
    </ToolbarButton>
    <HTMLPreviewModal
      @open={{this.previewOpen}}
      @doc={{this.exportPreview}}
      @onClose={{this.closePreview}}
    />
  </template>
}
