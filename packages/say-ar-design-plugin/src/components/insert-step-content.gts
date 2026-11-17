import { tracked } from '@glimmer/tracking';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import type { TOC } from '@ember/component/template-only';
import type ArDesign from '#root/plugin/models/ar-design.ts';
import t from 'ember-intl/helpers/t';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type {
  InsertPositionOption,
  ArticlePosition
} from '#root/plugin/types.ts';
import {
  afterLastArticle,
  ArticleInsertPosition,
  beforeFirstArticle,
} from '#root/plugin/utils/article-insert-position.ts';
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
     articles: ArticlePosition[];
     processDocumentHeadlessly: ProcessDocumentHeadlessly;
  };
  Element: HTMLDivElement;
};

export default class InsertStepContent extends Component<Sig> {
  @service declare intl: IntlService;
  @service declare arImporter: ArImporterService;

  @tracked _selected: InsertPositionOption | null = null;

  get beforeFirst(): InsertPositionOption {
    return {
      value: beforeFirstArticle,
      label: this.intl.t('ar-importer.controls.first'),
    };
  }
  get afterLast(): InsertPositionOption {
    return {
      value: afterLastArticle,
      label: this.intl.t('ar-importer.controls.last'),
    };
  }

  get onCursor(): InsertPositionOption {
    return {
      value: false,
      label: this.intl.t('ar-importer.controls.on-cursor'),
    };
  }

  get articleOptions(): InsertPositionOption[] {
    return this.args.articles.map((_, i) => ({
      value: new ArticleInsertPosition(i),
      label: this.intl.t('ar-importer.controls.after-article-x', {
        articleNumber: i + 1,
      }),
    }));
  }

  get options(): InsertPositionOption[] {
    if (this.args.regulatoryStatementMode) {
      return [this.onCursor];
    } else {
      return [
        this.afterLast,
        this.beforeFirst,
        this.onCursor,
        ...this.articleOptions,
      ];
    }
  }

  get selected(): InsertPositionOption {
    if (this._selected) {
      return this._selected;
    } else {
      return this.args.regulatoryStatementMode ? this.onCursor : this.afterLast;
    }
  }

  setSelected = (val: InsertPositionOption | null) => {
    this._selected = val;
  };

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
        @options={{this.options}}
        @selected={{this.selected}}
        @onChange={{this.setSelected}}
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
