import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { restartableTask, timeout } from 'ember-concurrency';
import type { SayController } from '@lblod/ember-rdfa-editor';

import type ArDesign from '#root/plugin/models/ar-design.ts';
import InsertStep from '#root/components/insert-step.gts';
import ArDesignOverview from '#root/components/overview.gts';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import type {
  ArDesignOverviewSortField,
  ArDesignQuery,
  ArticlePosition,
  DesignInfo,
  InstructionVariableQuery,
  ProcessDocumentHeadlessly,
} from '#root/plugin/types.ts';

const FILTER_TIMEOUT_MS = 300;

type Sig = {
  Args: {
    controller: SayController;
    onInsert?: () => void;
    articles: ArticlePosition[];
    designQuery: ArDesignQuery;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
    instructionVariableQuery: InstructionVariableQuery;
    decisionContext?: {
      decisionUri: string;
      decisionType?: string;
    };
    regulatoryStatementMode?: boolean;
  };
};

export default class ArWidgetContents extends Component<Sig> {
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

  <template>
    {{#if this.selectedDesign}}
      <InsertStep
        @arDesign={{this.selectedDesign}}
        @onReturnToOverview={{this.returnToOverview}}
        @controller={{@controller}}
        @onInsert={{@onInsert}}
        @articles={{@articles}}
        @processDocumentHeadlessly={{@processDocumentHeadlessly}}
        @decisionContext={{@decisionContext}}
        @instructionVariableQuery={{@instructionVariableQuery}}
        @regulatoryStatementMode={{@regulatoryStatementMode}}
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
