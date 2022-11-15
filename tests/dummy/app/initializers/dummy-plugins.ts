import Application from '@ember/application';
import DummyPlugin from 'dummy/testplugin/dummy-plugin';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
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
  application.register('plugin:dummy', pluginFactory(DummyPlugin), {
    singleton: false,
  });
  application.register(
    'plugin:inline-components',
    pluginFactory(InlineComponentsPlugin),
    {
      singleton: false,
    }
  );
}

export default {
  initialize,
};
