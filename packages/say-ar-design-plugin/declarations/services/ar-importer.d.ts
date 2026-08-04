import Service from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { EditorState, SayController } from '@lblod/ember-rdfa-editor';
import { type TransactionCombinatorResult, type TransactionMonad } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import type ArDesign from '../plugin/models/ar-design.ts';
import { ArticleInsertPosition } from '../plugin/utils/article-insert-position.ts';
export type ImportResult<R> = {
    result: R;
    warnings: string[];
};
export type GenerateImportResult = ImportResult<TransactionMonad<boolean>[]>;
export default class ArImporterService extends Service {
    intl: IntlService;
    _notifyError(controller: SayController, translationKey: string): void;
    generateInsertionMonads(design: ArDesign, 
    /**
     * Where to insert the design. If false, insert 'freely' and fail if decision URI is not
     * specified
     */
    insertPos: ArticleInsertPosition | false, 
    /** If controller is not passed, this is a preview */
    controller?: SayController, decisionUriOverride?: string): Promise<GenerateImportResult>;
    generatePreview(design: ArDesign, processDocumentHeadlessly: (html: string, transactionGenerator: (state: EditorState) => TransactionCombinatorResult<boolean>) => string): Promise<ImportResult<string>>;
    insertAr(controller: SayController, monads: TransactionMonad<boolean>[]): boolean;
}
