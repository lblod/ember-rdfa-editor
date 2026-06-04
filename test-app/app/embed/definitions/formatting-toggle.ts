import FormattingToggle from '@lblod/ember-rdfa-editor/components/plugins/formatting/formatting-toggle';
import type { PluginInitializer } from '../embedded-plugin.ts';
const name = 'formattingToggle';

export const setupFormattingToggle = (() => {
  return {
    name,
    toolbarWidgets: {
      formatting: FormattingToggle,
    },
  };
}) satisfies PluginInitializer;
