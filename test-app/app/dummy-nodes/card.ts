import type { ComponentLike } from '@glint/template';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  type EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import Card from 'test-app/components/sample-ember-nodes/card';

const emberNodeConfig: EmberNodeConfig = {
  name: 'card',
  component: Card as unknown as ComponentLike,
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
