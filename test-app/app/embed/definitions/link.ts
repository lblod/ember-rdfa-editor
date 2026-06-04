import {
  linkView,
  link,
  linkPasteHandler,
} from '@lblod/ember-rdfa-editor/plugins/link';
import type { PluginInitializer } from '../embedded-plugin.ts';

const name = 'link';

export const setupLinkPlugin = (() => {
  const config = { interactive: true, rdfaAware: true };

  const nodes = {
    link: link(config),
  };
  return {
    name,
    config,
    nodes,
    nodeViews: { link: linkView(config) },
    afterSetup(setup) {
      const { schema } = setup;
      const link = schema.nodes['link'];
      if (!link) {
        throw new Error(
          'impossible plugin state, link plugin sets up link node but was not found in resulting schema',
        );
      }
      return {
        ...setup,
        prosePlugins: [...setup.prosePlugins, linkPasteHandler(link)],
      };
    },
  };
}) satisfies PluginInitializer;
