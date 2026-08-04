import Component from '@glimmer/component';
import type ArImporterService from '../services/ar-importer.ts';
import { type ArInsertControlArgs } from './insert-controls';
import type { ProcessDocumentHeadlessly } from '../plugin/types.ts';
type ArPreviewSignature = {
    Args: ArInsertControlArgs & {
        onReturnToOverview: () => unknown;
        processDocumentHeadlessly: ProcessDocumentHeadlessly;
    };
    Element: HTMLDivElement;
};
export default class ArPreview extends Component<ArPreviewSignature> {
    arImporter: ArImporterService;
    preview: import("reactiveweb/function").State<Promise<import("../services/ar-importer.ts").ImportResult<string>>>;
    returnToOverview: () => void;
}
export {};
