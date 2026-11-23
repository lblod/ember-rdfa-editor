import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { task } from 'ember-concurrency';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import generateDesignSignTree from '#root/plugin/utils/generate-design-sign-tree.ts';
import generateMeasureTemplate from '#root/plugin/utils/generate-measure-template.ts';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { ArrowLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/arrow-left';
import type { SayController } from '@lblod/ember-rdfa-editor';
import type ArDesign from '#root/plugin/models/ar-design.ts';
import type ArImporterService from '#root/services/ar-importer.ts';
import type { GenerateImportResult } from '#root/services/ar-importer.ts';
import InsertControls, {
  type ArInsertControlArgs,
} from '#root/components/insert-controls.gts';
import type {
  InsertPositionOption,
  InstructionVariableQuery,
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
  Args: Omit<
    ArInsertControlArgs,
    'insertPosition' | 'onInsertAr' | 'insertLoading'
  > & {
    onReturnToOverview: () => unknown;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
    controller: SayController;
    onInsert?: () => void;
    decisionContext?: {
      decisionUri: string;
      decisionType?: string;
    };
    instructionVariableQuery: InstructionVariableQuery;
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

  get measureTemplates(): string[] | undefined {
    return this.measureDesigns.resolved?.map((signTree) =>
      generateMeasureTemplate(signTree.signs),
    );
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

  returnToOverview = () => {
    this.args.onReturnToOverview();
  };

  doInsert = (monads: GenerateImportResult['result']) => {
    const isSuccess = this.arImporter.insertAr(this.args.controller, monads);
    if (isSuccess) {
      this.args.onInsert?.();
    }
  };

  insertAr = task(
    async (
      design: ArDesign,
      insertPos: ArticleInsertPosition,
      skipWarnings?: boolean,
    ) => {
      const monadsResult = await this.arImporter.generateInsertionMonads(
        design,
        insertPos,
        this.args.controller,
        this.args.decisionContext?.decisionUri,
        this.args.regulatoryStatementMode,
        this.measureTemplates,
        this.args.instructionVariableQuery,
      );
      if (skipWarnings || monadsResult.warnings.length === 0) {
        this.doInsert(monadsResult.result);
      }
    },
  );

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
            @measureTemplates={{this.measureTemplates}}
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
          @onInsertAr={{this.insertAr.perform}}
          @insertLoading={{this.insertAr.isRunning}}
          @articles={{@articles}}
          @regulatoryStatementMode={{@regulatoryStatementMode}}
          @insertPosition={{this.insertPosition.value}}
        />
      </AuToolbar>
    </div>
  </template>
}
