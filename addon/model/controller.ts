import RawEditor from "@lblod/ember-rdfa-editor/utils/ce/raw-editor";

export default class EditorController {

  private readonly _owner: string;
  private readonly _editor: RawEditor;

  constructor(owner: string, editor: RawEditor) {
    this._owner = owner;
    this._editor = editor;
  }

  get owner(): string {
    return this._owner;
  }

  executeCommand(commandName: string, ...args: unknown[]) {
    this._editor.executeCommand(this._owner, commandName, ...args);
  }

}
