import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { htmlSafe } from '@ember/template';
import t from 'ember-intl/helpers/t';
import { trackedFunction } from 'reactiveweb/function';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { ArrowLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/arrow-left';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import type ArImporterService from '../services/ar-importer.ts';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { InsertControls, type ArInsertControlArgs } from './insert-controls.gts';
import type { ProcessDocumentHeadlessly } from '../plugin/types.ts';

type ArPreviewSignature = {
  Args: ArInsertControlArgs & {
    onReturnToOverview: () => unknown;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
  };
  Element: HTMLDivElement;
};

export default class ArPreview extends Component<ArPreviewSignature> {
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
    <div class='ar-importer-preview' ...attributes>
      <AuToolbar @size='medium' as |Group|>
        <Group>
          <AuButton
            @skin='link'
            @icon={{ArrowLeftIcon}}
            {{on 'click' this.returnToOverview}}
          >{{t 'ar-importer.preview.return-to-overview'}}</AuButton>
        </Group>
      </AuToolbar>
      <div class='ar-importer-preview__content au-o-layout'>
        {{#if this.preview.isLoading}}
          <AuLoader @centered={{true}} @hideMessage={{false}}>
            {{t 'application.loading'}}
          </AuLoader>
        {{/if}}
        {{#if this.preview.isError}}
          <AuAlert @icon='alert-triangle' @skin='error'>
            {{t 'ar-importer.message.error-processing-design'}}
          </AuAlert>
        {{/if}}
        {{#if this.preview.value}}
          {{#if this.preview.value.warnings}}
            <AuAlert
              @icon='alert-triangle'
              @skin='warning'
              class='au-u-margin-left au-u-margin-right'
            >
              {{#each this.preview.value.warnings as |warning|}}
                <p>{{warning}}</p>
              {{/each}}
            </AuAlert>
          {{/if}}
          {{htmlSafe this.preview.value.result}}
        {{/if}}
      </div>

      <AuToolbar @size='medium' as |Group|>
        <Group />
        <InsertControls
          @arDesign={{@arDesign}}
          @onInsertAr={{@onInsertAr}}
          @insertLoading={{@insertLoading}}
          @articles={{@articles}}
        />
      </AuToolbar>
    </div>
  </template>
}
