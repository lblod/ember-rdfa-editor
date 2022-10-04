/**
 * In rdfa-editor, we make a distinction the "core" and plugins.
 * The core takes care of managing the VDOM state and 2-way sync between DOM and VDOM.
 * It defines a set of primitive operations with which the document state can be queried and changed.
 *
 * Plugins use these primitives to actually implement the desired user-facing behavior and UI.
 * Some plugins are developed right in the rdfa-editor repo and can be considered "internal" plugins.
 * There is however no real distinction between them and "external" plugins,
 * they use the exact same interface to do their thing.
 */
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import Transaction from '../state/transaction';

export interface EditorPlugin {
  controller?: Controller;
  /**
   * Name of the plugin. Should be unique.
   * Convention is to use kebab-case for plugin names and to not repeat the word "plugin".
   *
   * example:
   * if your EditorPlugin class is called StandardTemplatesPlugin, this method should return
   * "standard-templates".
   */
  get name(): string;

  /**
   * This is the entrypoint for a plugin.
   *
   * In this method, plugins should:
   * - register any {@link Command commands} and {@link Query queries} they themselves define
   * - register any widgets
   * - setup any event listeners
   *
   * The method is awaited on, so plugins are able to depend on async operations
   * before they are expected to be "ready".
   *
   * In this method, plugins should not:
   * - execute {@link Command commands} (this will most likely simply fail, and will probably be completely impossible in the future)
   *
   * Plugins can expect other plugins that come before them in the plugin-config array
   * (aka editor-profile, to be refined) to be fully initialized.
   *
   * However, it is not advised to depend on this fact.
   * @param controller Each plugin receives a unique controller instance. It is their only interface to the editor.
   */
  initialize(
    transaction: Transaction,
    controller: Controller,
    options: unknown
  ): Promise<void>;

  willDestroy?(transaction: Transaction): Promise<void>;

  handleEvent?(event: InputEvent): { handled: boolean };
}
export type InitializedPlugin = Omit<EditorPlugin, 'initialize'>;
