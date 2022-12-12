import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

const emberNodeConfig: EmberNodeConfig = {
  name: 'dropdown',
  componentPath: 'inline-components-plugin/dropdown',
  inline: true,
  group: 'inline',
  atom: true,
};

export const dropdown = createEmberNodeSpec(emberNodeConfig);
export const dropdownView = createEmberNodeView(emberNodeConfig);
