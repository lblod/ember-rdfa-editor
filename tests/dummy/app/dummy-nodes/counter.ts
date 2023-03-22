import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';

const emberNodeConfig: EmberNodeConfig = {
  name: 'counter',
  componentPath: 'sample-ember-nodes/counter',
  inline: true,
  group: 'inline',
  atom: true,
  draggable: true,
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
  stopEvent() {
    return false;
  },
};

export const counter = createEmberNodeSpec(emberNodeConfig);
export const counterView = createEmberNodeView(emberNodeConfig);
