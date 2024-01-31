import {
  getRdfaAttrs,
  rdfaAttrSpec,
  renderRdfaAware,
} from '../../../core/schema';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  type EmberNodeConfig,
} from '../../../utils/ember-node';
import type { ComponentLike } from '@glint/template';
import Link from '@lblod/ember-rdfa-editor/components/ember-node/link';

type LinkOptions = {
  interactive: boolean;
};

// TODO this spec doesn't play well with RDFa editing tools. It has been modified so that any
// additional RDFa annotations are not striped. This is for example, used by the citation plugin in
// lblod-plugins
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
      href: {
        default: null,
      },
      interactive: {
        default: interactive,
      },
    },
    needsFFKludge: true,
    needsChromeCursorFix: true,
    parseDOM: [
      {
        tag: 'a',
        getAttrs(dom: string | HTMLElement) {
          if (typeof dom === 'string') {
            return false;
          }
          return {
            ...getRdfaAttrs(dom),
            href: dom.getAttribute('href'),
          };
        },
      },
    ],
    toDOM(node) {
      const { interactive, placeholder, ...attrs } = node.attrs;
      return renderRdfaAware({
        renderable: node,
        tag: 'a',
        attrs,
        rdfaContainerTag: 'span',
        contentContainerTag: 'span',
        content: 0,
      });
    },
  };
};

export const link = (options: LinkOptions) =>
  createEmberNodeSpec(emberNodeConfig(options));

export const linkView = (options: LinkOptions) =>
  createEmberNodeView(emberNodeConfig(options));
