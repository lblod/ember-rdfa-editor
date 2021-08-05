import Model from "@lblod/ember-rdfa-editor/model/model";
import {createLogger, Logger} from "@lblod/ember-rdfa-editor/utils/logging-utils";

/**
 * Commands are the only things that are allowed to modify the model.
 * TODO: Currently this restriction is not enforced yet.
 * They need to be registered with {@link RawEditor.registerCommand()} before they
 * can be executed with {@link RawEditor.executeCommand()}.
 */
export default abstract class Command<A extends unknown[] = unknown[], R = void> {
  abstract name: string;
  protected model: Model;
  protected logger: Logger;

  protected constructor(model: Model) {
    this.model = model;
    this.logger = createLogger(`command:${this.constructor.name}`);
  }

  canExecute(..._args: A[]): boolean {
    return true;
  }

  abstract execute(...args: A): R;
}
