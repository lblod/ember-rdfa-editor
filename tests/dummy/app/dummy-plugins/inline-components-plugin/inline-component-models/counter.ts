import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

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
        return parseInt(element.attributes.getNamedItem('count')!.value);
      },
    },
  },
};

export const counter = createEmberNodeSpec(emberNodeConfig);
export const counterView = createEmberNodeView(emberNodeConfig);
