import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { restartableTask, task, timeout } from 'ember-concurrency';
import type { SayController } from '@lblod/ember-rdfa-editor';

import type ArDesign from '../plugin/models/ar-design.ts';
import type ArImporterService from '../services/ar-importer.ts';
import type { GenerateImportResult } from '../services/ar-importer.ts';
import ArPreview from './preview.gts';
import ArDesignOverview from './overview.gts';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import type {
  ArDesignOverviewSortField,
  ArDesignQuery,
  ArticlePosition,
  DesignInfo,
  ProcessDocumentHeadlessly,
} from '../plugin/types';
import type { ArticleInsertPosition } from '../plugin/utils/article-insert-position.ts';

const FILTER_TIMEOUT_MS = 300;

type Sig = {
  Args: {
    controller: SayController;
    onInsert?: () => void;
    articles: ArticlePosition[];
    designQuery: ArDesignQuery;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
  };
};

export default class ArWidgetContents extends Component<Sig> {
  @service declare arImporter: ArImporterService;

  @tracked selectedDesign?: ArDesign | null;

  @tracked pageNumber: number = 0;
  pageSize: number = 20;
  @tracked sort?: ArDesignOverviewSortField = 'date';
  @tracked nameFilter = '';

  setNameFilter = (event: Event) => {
    if (event.target && 'value' in event.target) {
      this.nameFilter = event.target.value as string;
    }
  };
  resetFilters = () => {
    this.nameFilter = '';
  };

  arDesignsQuery = restartableTask(async () => {
    await timeout(FILTER_TIMEOUT_MS);
    const { pageNumber, pageSize, sort, nameFilter } = this;
    try {
      return this.args.designQuery({ pageNumber, pageSize, sort, nameFilter });
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  arDesigns = trackedTask<DesignInfo>(this, this.arDesignsQuery, () => [
    this.pageNumber,
    this.pageSize,
    this.sort,
    this.nameFilter,
  ]);

  updateSort = (sort?: ArDesignOverviewSortField) => {
    this.sort = sort;
    this.resetPagination();
  };

  resetPagination = () => {
    this.updatePageNumber(0);
  };

  updatePageNumber = (pageNumber: number) => {
    this.pageNumber = pageNumber;
  };

  selectDesign = (design: ArDesign) => {
    this.selectedDesign = design;
  };

  returnToOverview = () => {
    this.selectedDesign = null;
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
        this.args.controller,
        design,
        insertPos,
      );
      if (skipWarnings || monadsResult.warnings.length === 0) {
        this.doInsert(monadsResult.result);
      }
    },
  );

  <template>
    {{#if this.selectedDesign}}
      <ArPreview
        @arDesign={{this.selectedDesign}}
        @onReturnToOverview={{this.returnToOverview}}
        @onInsertAr={{this.insertAr.perform}}
        @insertLoading={{this.insertAr.isRunning}}
        @articles={{@articles}}
        @processDocumentHeadlessly={{@processDocumentHeadlessly}}
      />
    {{else}}
      <ArDesignOverview
        @arDesigns={{this.arDesigns.value}}
        @loading={{this.arDesigns.isRunning}}
        @onShowPreview={{this.selectDesign}}
        @nameFilter={{this.nameFilter}}
        @setNameFilter={{this.setNameFilter}}
        @resetFilters={{this.resetFilters}}
        @pageNumber={{this.pageNumber}}
        @pageSize={{this.pageSize}}
        @updatePageNumber={{this.updatePageNumber}}
        @sort={{this.sort}}
        @updateSort={{this.updateSort}}
      />
    {{/if}}
  </template>
}
