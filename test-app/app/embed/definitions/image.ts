import {
  checkPasteSize,
  imageView,
  imageWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/image';
import type { PluginInitializer } from '../embedded-plugin.ts';
import { mergeConfigs } from '../setup/defaults';
export type ImagePluginConfig = {
  allowBase64Images: boolean;
  pasteLimit: number;
  onLimitReached?: () => void;
};

const name = 'image';
const defaultConfig: ImagePluginConfig = {
  allowBase64Images: true,
  pasteLimit: 2000000,
};
export const setupImagePlugin = (({ options }) => {
  const config = mergeConfigs(defaultConfig, options?.image);
  const nodes = {
    image: imageWithConfig({
      allowBase64Images: config.allowBase64Images,
    }),
  };
  return {
    name,
    config,
    nodes,
    nodeViews: { image: imageView },
    prosePlugins: config.allowBase64Images
      ? [
          checkPasteSize({
            pasteLimit: config.pasteLimit,
            onLimitReached: config.onLimitReached,
          }),
        ]
      : [],
  };
}) satisfies PluginInitializer;
