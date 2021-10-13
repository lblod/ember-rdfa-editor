import {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";

/**
 * A command is an abstraction of a modification to the VDOM state.
 * It is the mutating half of the
 * {@link https://en.wikipedia.org/wiki/Command%E2%80%93query_separation Command-Query-Separation pattern}.
 * Commands are the only way in which plugins can modify the editor state.
 *
 * Throughout the lifetime of the {@link Editor}
 * (which is identical to the lifetime of its ember component in the host app)
 * a single instance of each registered command will be made.
 * It is discouraged to rely on this and keep state between command executions.
 * (The reason for it being a class rather than a function
 * is that we may need to keep things like disabled/enabled state in the future.
 * Arguments can be made here both ways, but this is what we have at the moment.)
 *
 * Commands are defined by {@link Plugin plugins} */
export default abstract class Command<A extends unknown[], R> {
  abstract name: string;
  protected model: MutableModel;

  public constructor(model: MutableModel) {
    this.model = model;
  }

  /**
   * This method is used to signal if a command "makes sense" in a certain context.
   * It is a bit of an oddity, at the moment only few commands actually implement it.
   * It is as of yet unclear if this is a good place for this kind of logic to live.
   * @param _args
   */
  canExecute(..._args: A): boolean {
    return true;
  }

  /**
   * This is where the magic happens. Commands are allowed to freely choose what arguments they require.
   * Typically commands take in some sort of {@link ModelRange} or other context
   * (TODO: first-class support for using rdfa-context as a specifier, it's already possible but still a bit cumbersome)
   * on which they operate.
   * Modifications to the VDOM are made through the {@link MutableModel} interface,
   * of which commands receive an instance in their constructors (see below).
   * This interface provides not much more than a single {@link MutableModel.change change} method.
   * Commands use the {@link Inspector} to query for VDOM state, and the {@link Mutator} to change it.
   * This single entrypoint allows the editor to precisely manage its own state, enabling async editing in the future.
   * @param source The origin of this particular command execution. Usually the name of a {@link EditorPlugin}
   * @param args
   */
  abstract execute(source: string, ...args: A): R;
}
