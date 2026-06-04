import type { PluginInitializer } from '../embedded-plugin';
import HTMLEditorMenu from '@lblod/ember-rdfa-editor/components/plugins/html-editor/menu';
const name = 'htmlEdit';
export const setupHtmlEdit = (() => {
  return {
    name,
    toolbarWidgets: {
      'html:edit': HTMLEditorMenu,
    },
  };
}) satisfies PluginInitializer;
