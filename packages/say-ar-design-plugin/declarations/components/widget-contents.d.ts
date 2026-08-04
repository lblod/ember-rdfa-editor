import Component from '@glimmer/component';
import type { SayController } from '@lblod/ember-rdfa-editor';
import type ArDesign from '../plugin/models/ar-design.ts';
import type ArImporterService from '../services/ar-importer.ts';
import type { GenerateImportResult } from '../services/ar-importer.ts';
import type { ArDesignOverviewSortField, ArDesignQuery, ArticlePosition, DesignInfo, ProcessDocumentHeadlessly } from '../plugin/types';
import type { ArticleInsertPosition } from '../plugin/utils/article-insert-position.ts';
type Sig = {
    Args: {
        controller: SayController;
        onInsert?: () => void;
        articles: ArticlePosition[];
        designQuery: ArDesignQuery;
        processDocumentHeadlessly: ProcessDocumentHeadlessly;
        decisionContext?: {
            decisionUri: string;
            decisionType?: string;
        };
    };
};
export default class ArWidgetContents extends Component<Sig> {
    arImporter: ArImporterService;
    selectedDesign?: ArDesign | null;
    pageNumber: number;
    pageSize: number;
    sort?: ArDesignOverviewSortField;
    nameFilter: string;
    setNameFilter: (event: Event) => void;
    resetFilters: () => void;
    arDesignsQuery: import("ember-concurrency").TaskForAsyncTaskFunction<unknown, () => Promise<DesignInfo>>;
    arDesigns: import("reactiveweb/ember-concurrency").TaskInstance<DesignInfo>;
    updateSort: (sort?: ArDesignOverviewSortField) => void;
    resetPagination: () => void;
    updatePageNumber: (pageNumber: number) => void;
    selectDesign: (design: ArDesign) => void;
    returnToOverview: () => void;
    doInsert: (monads: GenerateImportResult["result"]) => void;
    insertAr: import("ember-concurrency").TaskForAsyncTaskFunction<unknown, (design: ArDesign, insertPos: ArticleInsertPosition, skipWarnings?: boolean) => Promise<void>>;
}
export {};
