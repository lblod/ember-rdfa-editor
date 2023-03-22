import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/_private/ember-node';

const emberNodeConfig: EmberNodeConfig = {
  name: 'dropdown',
  componentPath: 'sample-ember-nodes/dropdown',
  inline: true,
  group: 'inline',
  atom: true,
  draggable: true,
  stopEvent() {
    return false;
  },
};

export const dropdown = createEmberNodeSpec(emberNodeConfig);
export const dropdownView = createEmberNodeView(emberNodeConfig);
