import Application from '@ember/application';
import DummyPlugin from 'dummy-plugin/dummy-plugin';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';

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
  application.register('plugin:besluit', pluginFactory(DummyPlugin), {
    singleton: false,
  });
}

export default {
  initialize,
};
