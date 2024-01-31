import type { ComponentLike } from '@glint/template';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  type EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import Dropdown from 'dummy/components/sample-ember-nodes/dropdown';

const emberNodeConfig: EmberNodeConfig = {
  name: 'dropdown',
  component: Dropdown as unknown as ComponentLike,
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
