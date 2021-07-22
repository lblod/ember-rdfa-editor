import Model from "@lblod/ember-rdfa-editor/model/model";
import { LogLevels } from "diary";

declare global {
  interface Window {
    __VDOM: Model;
    __executeCommand: (commandName: string, ...args: unknown[]) => void;
    setLogLevel: (level: LogLevels) => void;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
