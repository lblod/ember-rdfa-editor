import Model from '@lblod/ember-rdfa-editor/model/model';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';

declare global {
  interface Window {
    __VDOM: Model;
    __EDITOR: RawEditor;
    __executeCommand: (commandName: string, ...args: unknown[]) => void;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
