import { type TOC } from '@ember/component/template-only';
type Signature = {
    Args: {
        rangeStart: number;
        rangeEnd: number;
        totalCount: number;
        isFirstPage: boolean;
        isLastPage: boolean;
        onPreviousPage: () => void;
        onNextPage: () => void;
    };
};
declare const PaginationView: TOC<Signature>;
export default PaginationView;
