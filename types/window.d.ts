import State from '@lblod/ember-rdfa-editor/core/state';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';

declare global {
  interface Window {
    __STATE: State;
    __EDITOR: Controller;
    __executeCommand: (commandName: string, ...args: unknown[]) => void;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
