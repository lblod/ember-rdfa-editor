import type { AuMainContainerSignature } from '@appuniversum/ember-appuniversum/components/au-main-container';
import type ArDesign from '../plugin/models/ar-design.ts';
import type { ArDesignOverviewSortField, DesignInfo } from '../plugin/types.ts';
import type { TOC } from '@ember/component/template-only';
export type ArDesignOverviewSignature = {
    Element: AuMainContainerSignature['Element'];
    Args: {
        arDesigns?: DesignInfo | null;
        loading?: boolean;
        onShowPreview: (arDesign: ArDesign) => void;
        nameFilter?: string;
        setNameFilter: (event: Event) => unknown;
        resetFilters: () => unknown;
        pageNumber: number;
        pageSize: number;
        updatePageNumber: (page: number) => unknown;
        sort?: ArDesignOverviewSortField;
        updateSort: (field?: ArDesignOverviewSortField) => unknown;
    };
};
declare const ArDesignOverview: TOC<ArDesignOverviewSignature>;
export default ArDesignOverview;
