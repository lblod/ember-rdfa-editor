import { RawEditor } from "../editor/raw-editor";

export default abstract class Command {
  abstract name: string;
  protected editor: RawEditor;
  constructor(editor: RawEditor) {
    this.editor = editor;
  }
  abstract execute(...args: any[]): void;
}
