import Application from '@ember/application';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import HighlightPlugin from '../dummy-plugins/highlight-plugin/highlight-plugin';

function pluginFactory(plugin: new () => EditorPlugin) {
  return {
    create: (initializers: unknown) => {
      const pluginInstance = new plugin();
      Object.assign(pluginInstance, initializers);
      return pluginInstance;
    },
  };
}

export function initialize(application: Application) {
  application.register('plugin:highlight', pluginFactory(HighlightPlugin), {
    singleton: false,
  });
}

export default {
  initialize,
};
