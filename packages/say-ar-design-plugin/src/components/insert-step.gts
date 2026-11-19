import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { trackedFunction } from 'reactiveweb/function';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import generateDesignSignTree from '#root/plugin/utils/generate-design-sign-tree.ts';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { ArrowLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/arrow-left';
import type ArImporterService from '#root/services/ar-importer.ts';
import InsertControls, {
  type ArInsertControlArgs,
} from '#root/components/insert-controls.gts';
import type {
  InsertPositionOption,
  ProcessDocumentHeadlessly,
} from '#root/plugin/types.ts';
import InsertStepSidebar from '#root/components/insert-step-sidebar.gts';
import InsertStepContent from '#root/components/insert-step-content.gts';
import type IntlService from 'ember-intl/services/intl';
import {
  afterLastArticle,
  ArticleInsertPosition,
  beforeFirstArticle,
} from '#root/plugin/utils/article-insert-position.ts';

type ArPreviewSignature = {
  Args: Omit<ArInsertControlArgs, 'insertPosition'> & {
    onReturnToOverview: () => unknown;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
    regulatoryStatementMode?: boolean;
  };
  Element: HTMLDivElement;
};

export default class InsertStep extends Component<ArPreviewSignature> {
  @service declare arImporter: ArImporterService;
  @service declare intl: IntlService;

  @tracked _insertPosition: InsertPositionOption | null = null;

  @cached
  get measureDesignSignTree() {
    return generateDesignSignTree(this.args.arDesign);
  }

  get measureDesigns() {
    return getPromiseState(this.measureDesignSignTree);
  }

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

  get insertPosition(): InsertPositionOption {
    if (this._insertPosition) {
      return this._insertPosition;
    } else {
      return this.args.regulatoryStatementMode ? this.onCursor : this.afterLast;
    }
  }

  setInsertPosition = (val: InsertPositionOption | null) => {
    this._insertPosition = val;
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
          <InsertStepSidebar @measureDesigns={{this.measureDesigns}} />
        </div>
        <div class="au-o-grid__item au-u-2-3 au-u-3-4@medium au-u-4-5@large">
          <InsertStepContent
            @arDesign={{@arDesign}}
            @processDocumentHeadlessly={{@processDocumentHeadlessly}}
            @options={{this.options}}
            @selected={{this.insertPosition}}
            @onChange={{this.setInsertPosition}}
          />
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
          @insertPosition={{this.insertPosition.value}}
        />
      </AuToolbar>
    </div>
  </template>
}
