import Application from '@ember/application';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import CodeMarkPlugin from '../dummy-plugins/code-mark-plugin/code-plugin';
import HighlightPlugin from '../dummy-plugins/highlight-plugin/highlight-plugin';
import InlineComponentsPlugin from '../dummy-plugins/inline-components-plugin/inline-components-plugin';

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
  application.register(
    'plugin:inline-components',
    pluginFactory(InlineComponentsPlugin),
    {
      singleton: false,
    }
  );
  application.register('plugin:code-mark', pluginFactory(CodeMarkPlugin), {
    singleton: false,
  });
}

export default {
  initialize,
};
