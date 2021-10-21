import {LogLevels} from "diary";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";

declare global {
  interface Window {
    __controller: EditorController
    setLogLevel: (level: LogLevels) => void;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}
