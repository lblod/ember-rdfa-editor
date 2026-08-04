import Component from '@glimmer/component';
import type { ComponentLike } from '@glint/template';
export type ReactiveTableSignature<T, S extends string> = {
    Args: {
        pageSize?: number;
        page?: number;
        sort?: S;
        isLoading?: boolean;
        noDataMessage?: string;
        hidePagination?: boolean;
        fields?: string | string[];
        content?: T[] | null;
        onPageChange?: (newPage: number) => void;
        onSortChange?: (newSort?: S) => void;
    };
    Blocks: {
        menu?: [];
        header: [
            {
                Sortable: ComponentLike<{
                    field: string;
                    label: string;
                }>;
            }
        ];
        body: [item: T];
    };
};
export default class ReactiveTable<T, S extends string> extends Component<ReactiveTableSignature<T, S>> {
    _page: number;
    _sort: S | '';
    get pageSize(): number;
    get page(): number;
    get sort(): "" | S;
    initialize(): void;
    onPageChange(): void;
    onSortChange(): void;
    onExternalPageChange(): void;
    onExternalSortChange(): void;
}
