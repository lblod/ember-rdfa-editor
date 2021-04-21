import Model from "@lblod/ember-rdfa-editor/model/model";

declare global {
  interface Window {
    __VDOM: Model;
    __executeCommand: (commandName: string, ...args: unknown[]) => void;
  }
}
