import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { trackedFunction } from 'reactiveweb/function';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { ArrowLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/arrow-left';
import type ArImporterService from '../services/ar-importer.ts';
import {
  InsertControls,
  type ArInsertControlArgs,
} from './insert-controls.gts';
import type { ProcessDocumentHeadlessly } from '../plugin/types.ts';
import InsertStepSidebar from './insert-step-sidebar.gts';

type ArPreviewSignature = {
  Args: ArInsertControlArgs & {
    onReturnToOverview: () => unknown;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
    regulatoryStatementMode?: boolean;
  };
  Element: HTMLDivElement;
};

export default class InsertStep extends Component<ArPreviewSignature> {
  @service declare arImporter: ArImporterService;

  preview = trackedFunction(this, async () => {
    try {
      return this.arImporter.generatePreview(
        this.args.arDesign,
        this.args.processDocumentHeadlessly,
      );
    } catch (e) {
      console.error('Error generating preview', e);
      throw e;
    }
  });

  returnToOverview = () => {
    this.args.onReturnToOverview();
  };

  <template>
    <div class="ar-importer-preview" ...attributes>
      <AuToolbar @size="medium" as |Group|>
        <Group>
          <AuButton
            @skin="link"
            @icon={{ArrowLeftIcon}}
            {{on "click" this.returnToOverview}}
          >{{t "ar-importer.preview.return-to-overview"}}</AuButton>
        </Group>
      </AuToolbar>
      <div class="au-o-grid au-u-height-full au-u-margin-none">
        <div class="au-o-grid__item au-u-1-3 au-u-1-4@medium au-u-1-5@large">
          <InsertStepSidebar @arDesign={{@arDesign}} />
        </div>
        <div class="au-o-grid__item au-u-2-3 au-u-3-4@medium au-u-4-5@large">
          Content
        </div>
      </div>

      <AuToolbar @size="medium" as |Group|>
        <Group />
        <InsertControls
          @arDesign={{@arDesign}}
          @onInsertAr={{@onInsertAr}}
          @insertLoading={{@insertLoading}}
          @articles={{@articles}}
          @regulatoryStatementMode={{@regulatoryStatementMode}}
        />
      </AuToolbar>
    </div>
  </template>
}
