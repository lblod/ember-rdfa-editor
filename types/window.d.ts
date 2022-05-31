import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import Model from '@lblod/ember-rdfa-editor/model/model';

declare global {
  interface Window {
    __VDOM: Model;
    __EDITOR: Editor;
    __executeCommand: (commandName: string, ...args: unknown[]) => void;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
