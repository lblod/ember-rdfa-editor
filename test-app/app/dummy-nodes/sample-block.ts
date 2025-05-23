import type { ComponentLike } from '@glint/template';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  type EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import SampleBlock from 'test-app/components/sample-ember-nodes/sample-block';

const emberNodeConfig: EmberNodeConfig = {
  name: 'sample_block',
  component: SampleBlock as unknown as ComponentLike,
  inline: false,
  group: 'block',
  content: 'block+',
  contentDomClassNames: ['say-dummy-sample-block__content'],
  atom: false,
  draggable: false,
  selectable: true,
  isolating: true,
};

export const sample_block = createEmberNodeSpec(emberNodeConfig);

export const sampleBlockView = createEmberNodeView(emberNodeConfig);
