import Prosemirror, {
  ProseController,
} from '@lblod/ember-rdfa-editor/core/prosemirror';

declare global {
  interface Window {
    __PM: Prosemirror;
    __PC: ProseController;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
