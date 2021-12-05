import Model from '@lblod/ember-rdfa-editor/model/model';
import { LogLevels } from 'diary';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';

declare global {
  interface Window {
    __VDOM: Model;
    __EDITOR: RawEditor;
    __executeCommand: (commandName: string, ...args: unknown[]) => void;
    setLogLevel: (level: LogLevels) => void;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
