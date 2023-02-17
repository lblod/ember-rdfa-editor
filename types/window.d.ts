import SayEditor, {
  SayController,
} from '@lblod/ember-rdfa-editor/core/say-editor';

declare global {
  interface Window {
    __PM: SayEditor;
    __PC: SayController;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
