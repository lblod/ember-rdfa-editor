import type { ComponentLike } from '@glint/template';
import { emberApplicationPluginKey } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  type EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';
import Counter from '../components/sample-ember-nodes/counter';
import type IntlService from 'ember-intl/services/intl';

const emberNodeConfig: EmberNodeConfig = {
  name: 'counter',
  component: Counter as unknown as ComponentLike,
  inline: true,
  group: 'inline',
  atom: true,
  draggable: true,
  attrs: {
    count: {
      default: 0,
      serialize: (node) => {
        return (node.attrs['count'] as number).toString();
      },
      parse: (element) => {
        return optionMapOr(0, parseInt, element.getAttribute('count'));
      },
    },
  },
  stopEvent() {
    return false;
  },
  serialize: (node, state) => {
    const intl = emberApplicationPluginKey
      .getState(state)
      ?.application.lookup('service:intl') as IntlService | undefined;
    const lang = state.doc.attrs['lang'] as string;
    const count = node.attrs['count'] as number;
    const serializedAttributes: Record<string, string> = {
      'data-ember-node': 'counter',
      'data-count': count.toString(),
    };
    const content = intl
      ? intl.t('ember-rdfa-editor.dummy.counter.label', { locale: lang })
      : 'Counter';
    return ['span', serializedAttributes, content];
  },
};

export const counter = createEmberNodeSpec(emberNodeConfig);
export const counterView = createEmberNodeView(emberNodeConfig);
