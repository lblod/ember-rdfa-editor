import {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";

/**
 * Commands are the only things that are allowed to modify the model.
 * TODO: Currently this restriction is not enforced yet.
 * They need to be registered with {@link RawEditor.registerCommand()} before they
 * can be executed with {@link RawEditor.executeCommand()}.
 */
export default abstract class Command<A extends unknown[], R> {
  abstract name: string;
  protected model: MutableModel;

  public constructor(model: MutableModel) {
    this.model = model;
  }

  canExecute(..._args: A): boolean {
    return true;
  }

  abstract execute(source: string, ...args: A): R;
}
