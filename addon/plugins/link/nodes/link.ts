import { getRdfaAttrs, rdfaAttrSpec } from '../../../core/schema';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '../../../utils/ember-node';
import type { ComponentLike } from '@glint/template';
import Link from '@lblod/ember-rdfa-editor/components/ember-node/link';

type LinkOptions = {
  interactive: boolean;
};

const emberNodeConfig: (options: LinkOptions) => EmberNodeConfig = (
  options,
) => {
  const { interactive } = options;
  return {
    name: 'link',
    component: Link as unknown as ComponentLike,
    inline: true,
    group: 'inline',
    content: 'text*',
    atom: true,
    defining: true,
    draggable: false,
    attrs: {
      ...rdfaAttrSpec,
      interactive: {
        default: interactive,
      },
    },
    needsFFKludge: true,
    needsChromeCursorFix: true,
    parseDOM: [
      {
        tag: 'a',
        getAttrs(dom: HTMLElement) {
          return {
            ...getRdfaAttrs(dom),
          };
        },
      },
    ],
    toDOM(node) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { interactive, placeholder, ...attrs } = node.attrs;
      return ['a', attrs, 0];
    },
  };
};

export const link = (options: LinkOptions) =>
  createEmberNodeSpec(emberNodeConfig(options));

export const linkView = (options: LinkOptions) =>
  createEmberNodeView(emberNodeConfig(options));
