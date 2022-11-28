import Application from '@ember/application';
import RdfaEditorPlugin from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import CodeMarkPlugin from '../dummy-plugins/code-mark-plugin/code-plugin';

function pluginFactory(plugin: new () => RdfaEditorPlugin) {
  return {
    create: (initializers: unknown) => {
      const pluginInstance = new plugin();
      Object.assign(pluginInstance, initializers);
      return pluginInstance;
    },
  };
}

export function initialize(application: Application) {
  // application.register('plugin:highlight', pluginFactory(HighlightPlugin), {
  //   singleton: false,
  // });
  // application.register(
  //   'plugin:inline-components',
  //   pluginFactory(InlineComponentsPlugin),
  //   {
  //     singleton: false,
  //   }
  // );
  application.register('plugin:code-mark', pluginFactory(CodeMarkPlugin), {
    singleton: false,
  });
}

export default {
  initialize,
};
