import SayEditor from '@lblod/ember-rdfa-editor/core/say-editor';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

declare global {
  interface Window {
    __PM: SayEditor;
    __PC: SayController;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
