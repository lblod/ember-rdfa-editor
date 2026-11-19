import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import type { TOC } from '@ember/component/template-only';
import type ArDesign from '#root/plugin/models/ar-design.ts';
import t from 'ember-intl/helpers/t';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import Component from '@glimmer/component';
import { service } from '@ember/service';
import type { InsertPositionOption } from '#root/plugin/types.ts';
import type { ProcessDocumentHeadlessly } from '../plugin/types.ts';
import type ArImporterService from '../services/ar-importer.ts';
import { trackedFunction } from 'reactiveweb/function';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { htmlSafe } from '@ember/template';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';

type Sig = {
  Args: {
    arDesign: ArDesign;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
    options: InsertPositionOption[];
    selected: InsertPositionOption;
    onChange: (
      selected: InsertPositionOption,
      select: Select,
      event?: Event,
    ) => void;
  };
  Element: HTMLDivElement;
};

export default class InsertStepContent extends Component<Sig> {
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

  <template>
    <div class='ar-importer__insert-position-container au-u-margin-bottom'>
      <InsertPositionSelector
        @options={{@options}}
        @selected={{@selected}}
        @onChange={{@onChange}}
      />
    </div>
    <div class="ar-importer-preview__content">
      <AuHeading @level='4' @skin='6' class='au-u-margin-bottom-small'>{{t 'ar-importer.preview.heading'}} </AuHeading>
      {{#if this.preview.isLoading}}
        <AuLoader @centered={{true}} @hideMessage={{false}}>
          {{t "application.loading"}}
        </AuLoader>
      {{/if}}
      {{#if this.preview.isError}}
        <AuAlert @icon="alert-triangle" @skin="error">
          {{t "ar-importer.message.error-processing-design"}}
        </AuAlert>
      {{/if}}
      {{#if this.preview.value}}
        {{#if this.preview.value.warnings}}
          <AuAlert
            @icon="alert-triangle"
            @skin="warning"
            class="au-u-margin-left au-u-margin-right"
          >
            {{#each this.preview.value.warnings as |warning|}}
              <p>{{warning}}</p>
            {{/each}}
          </AuAlert>
        {{/if}}
        {{htmlSafe this.preview.value.result}}
      {{/if}}
      </div>
  </template>
}


const InsertPositionSelector: TOC<{
  Args: {
    options: InsertPositionOption[];
    selected: InsertPositionOption | null;
    onChange: (
      selected: InsertPositionOption,
      select: Select,
      event?: Event,
    ) => void;
  };
}> = <template>
  <AuLabel for="ar-importer-position-selector">{{t
      "ar-importer.controls.select-position"
    }}:</AuLabel>
    <PowerSelect
      id="ar-importer-position-selector"
      @allowClear={{false}}
      @onChange={{@onChange}}
      @selected={{@selected}}
      @options={{@options}}
      as |option|
    >{{option.label}}</PowerSelect>
</template>;
