import type ArDesign from '../plugin/models/ar-design.ts';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type { ArInsertFunc, ArticlePosition, InsertPositionOption } from '../plugin/types.ts';
export interface ArInsertControlArgs {
    arDesign: ArDesign;
    onInsertAr: ArInsertFunc;
    insertLoading?: boolean;
    articles: ArticlePosition[];
}
type Sig = {
    Args: ArInsertControlArgs;
};
export declare class InsertControls extends Component<Sig> {
    _selected: InsertPositionOption | null;
    intl: IntlService;
    get beforeFirst(): InsertPositionOption;
    get afterLast(): InsertPositionOption;
    get articleOptions(): InsertPositionOption[];
    get options(): InsertPositionOption[];
    get selected(): InsertPositionOption;
    setSelected: (val: InsertPositionOption | null) => void;
}
export {};
