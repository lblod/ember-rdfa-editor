import { LogLevels } from "diary";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

declare global {
  interface Window {
    __VDOM: EditorModel;
    __executeCommand: (commandName: string, ...args: unknown[]) => void;
    setLogLevel: (level: LogLevels) => void;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
