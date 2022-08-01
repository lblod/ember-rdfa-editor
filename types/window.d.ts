import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import State from '@lblod/ember-rdfa-editor/core/state';

declare global {
  interface Window {
    __STATE: State;
    __EDITOR: Editor;
    __executeCommand: (commandName: string, ...args: unknown[]) => void;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
