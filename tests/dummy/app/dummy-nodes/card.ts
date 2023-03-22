import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/_private/ember-node';

const emberNodeConfig: EmberNodeConfig = {
  name: 'card',
  componentPath: 'sample-ember-nodes/card',
  inline: false,
  group: 'block',
  content: 'inline*',
  atom: false,
  draggable: true,
  stopEvent() {
    return false;
  },
};

export const card = createEmberNodeSpec(emberNodeConfig);

export const cardView = createEmberNodeView(emberNodeConfig);
