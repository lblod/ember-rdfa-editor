import { getRdfaAttrs, rdfaAttrs } from '../core/schema';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '../utils/ember-node';

type LinkOptions = {
  interactive: boolean;
};

const emberNodeConfig: (options: LinkOptions) => EmberNodeConfig = (
  options
) => {
  const { interactive } = options;
  return {
    name: 'link',
    componentPath: 'ember-node/link',
    inline: true,
    group: 'inline',
    content: 'text*',
    atom: true,
    draggable: false,
    attrs: {
      ...rdfaAttrs,
      interactive: {
        default: interactive,
      },
    },
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
    toDOM(mark) {
      return ['a', mark.attrs, 0];
    },
  };
};

export const link = (options: LinkOptions) =>
  createEmberNodeSpec(emberNodeConfig(options));

export const linkView = (options: LinkOptions) =>
  createEmberNodeView(emberNodeConfig(options));
