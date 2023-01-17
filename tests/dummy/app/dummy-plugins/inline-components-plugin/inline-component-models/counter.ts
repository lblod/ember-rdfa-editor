import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/option';

const emberNodeConfig: EmberNodeConfig = {
  name: 'counter',
  componentPath: 'inline-components-plugin/counter',
  inline: true,
  group: 'inline',
  atom: true,
  attrs: {
    count: {
      default: 0,
      serialize: (node) => {
        return (node.attrs.count as number).toString();
      },
      parse: (element) => {
        return optionMapOr(0, parseInt, element.getAttribute('count'));
      },
    },
  },
};

export const counter = createEmberNodeSpec(emberNodeConfig);
export const counterView = createEmberNodeView(emberNodeConfig);
