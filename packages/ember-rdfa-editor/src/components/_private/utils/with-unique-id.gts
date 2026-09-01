/* eslint-disable ember/no-empty-glimmer-component-classes */
import Component from '@glimmer/component';
import { uniqueId } from '@ember/helper';

interface Sig {
  Blocks: {
    default: [string];
  };
}

/**
 * @deprecated remove and import uniqueId
 */
export default class WithUniqueIdComponent extends Component<Sig> {
  <template>
    {{#let (uniqueId) as |id|}}
      {{yield id}}
    {{/let}}
  </template>
}
