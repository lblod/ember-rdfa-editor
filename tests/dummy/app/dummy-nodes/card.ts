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
  content: 'block+',
  atom: false,
  draggable: false,
  selectable: true,
  isolating: true,
};

export const card = createEmberNodeSpec(emberNodeConfig);

export const cardView = createEmberNodeView(emberNodeConfig);
