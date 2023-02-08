import { getRdfaAttrs, rdfaAttrs } from '../core/schema';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '../utils/ember-node';

const emberNodeConfig: EmberNodeConfig = {
  name: 'link',
  componentPath: 'editor-components/link',
  inline: true,
  group: 'inline',
  content: 'text*',
  atom: true,
  draggable: false,
  attrs: {
    ...rdfaAttrs,
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

export const link = createEmberNodeSpec(emberNodeConfig);
export const linkView = createEmberNodeView(emberNodeConfig);
