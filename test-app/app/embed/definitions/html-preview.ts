import type { PluginInitializer } from '../embedded-plugin.ts';
import HTMLPreviewMenu from '../../components/html-preview/menu.gts';
const name = 'htmlPreview';

export const setupHtmlPreview = (() => {
  return {
    name,
    toolbarWidgets: {
      'html:preview': HTMLPreviewMenu,
    },
  };
}) satisfies PluginInitializer;
