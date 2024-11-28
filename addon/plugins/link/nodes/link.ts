import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';
import {
  getRdfaAttrs,
  getRdfaContentElement,
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
  interactive?: boolean;
  rdfaAware?: boolean;
};

// TODO this spec doesn't play well with RDFa editing tools. It has been modified so that any
// additional RDFa annotations are not striped. This is for example, used by the citation plugin in
// lblod-plugins
const emberNodeConfig: (options?: LinkOptions) => EmberNodeConfig = ({
  interactive = false,
  rdfaAware = false,
} = {}) => {
  return {
    name: 'link',
    component: Link as unknown as ComponentLike,
    inline: true,
    group: 'inline',
    content: 'text*',
    atom: true,
    defining: true,
    draggable: false,
    classNames: ['say-pill', 'say-link'],
    get attrs() {
      const baseAttrs = {
        href: {
          default: null,
        },
        interactive: {
          default: interactive,
        },
      };
      return {
        ...rdfaAttrSpec({ rdfaAware }),
        ...baseAttrs,
      };
    },
    needsFFKludge: true,
    needsChromeCursorFix: true,
    get parseDOM() {
      return [
        {
          tag: 'a',
          getAttrs(dom: string | HTMLElement) {
            if (typeof dom === 'string') {
              return false;
            }
            const href = dom.getAttribute('href');
            return {
              ...getRdfaAttrs(dom, { rdfaAware }),
              href,
            };
          },
          contentElement: getRdfaContentElement,
        },
      ];
    },
    toDOM(node) {
      const { interactive: _, placeholder: __, ...attrs } = node.attrs;
      if (rdfaAware) {
        return renderRdfaAware({
          renderable: node,
          tag: 'a',
          attrs: { ...attrs, class: getClassnamesFromNode(node) },
          content: 0,
        });
      } else {
        return ['a', { ...attrs, class: getClassnamesFromNode(node) }, 0];
      }
    },
  };
};

export const link = (options?: LinkOptions) =>
  createEmberNodeSpec(emberNodeConfig(options));

export const linkView = (options?: LinkOptions) =>
  createEmberNodeView(emberNodeConfig(options));
