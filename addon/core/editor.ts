import { ResolvedPluginConfig } from '../components/rdfa/rdfa-editor';
import { createView, View, ViewArgs } from './view';
import { InitializedPlugin } from '@lblod/ember-rdfa-editor/model/editor-plugin';
import { ViewController } from '@lblod/ember-rdfa-editor/core/controllers/controller';

export interface EditorArgs extends ViewArgs {
  /**
   * The plugins that should be active from the start of the editor
   * */
  plugins: ResolvedPluginConfig[];
}

/**
 * Creates an editor and initializes the initial plugins
 * */
export async function createEditorView({
  domRoot,
  plugins,
  initialState,
  dispatch,
}: EditorArgs): Promise<View> {
  const state = initialState;
  const view = createView({ domRoot, dispatch, initialState: state });
  const initPlugins = await initializePlugins(view, plugins);
  const tr = view.currentState.createTransaction();
  tr.setPlugins(initPlugins);
  view.dispatch(tr);
  return view;
}

/**
 * Before use, plugins need to be initialized, which provides them with the controller
 * they need to interact with the editor. Since plugins often interact with backends,
 * this is async.
 * */
async function initializePlugins(
  view: View,
  configs: ResolvedPluginConfig[]
): Promise<InitializedPlugin[]> {
  const result: InitializedPlugin[] = [];
  for (const config of configs) {
    const plugin = config.instance;
    const controller = new ViewController(plugin.name, view);
    await plugin.initialize(controller, config.options);
    result.push(plugin);
  }
  return result;
}
