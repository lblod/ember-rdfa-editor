import Component from '@glimmer/component';
import type { SayController } from '@lblod/ember-rdfa-editor';
import type { ArDesignQuery, ArticlePosition, ProcessDocumentHeadlessly } from '../plugin/types.ts';
export type ArDesignSidebarWidgetSig = {
    Args: {
        controller: SayController;
        designQuery: ArDesignQuery;
        processDocumentHeadlessly: ProcessDocumentHeadlessly;
        /** Instead of finding a decision node in the document, pass the relevant URI and type */
        decisionContext?: {
            decisionUri: string;
            decisionType?: string;
        };
    };
    Element: HTMLLIElement;
};
export default class ArDesignSidebarWidget extends Component<ArDesignSidebarWidgetSig> {
    modalOpen: boolean;
    articles: ArticlePosition[];
    openModal: () => void;
    closeModal: () => void;
    get disableInsert(): boolean;
}
