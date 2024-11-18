/* eslint-disable ember/no-empty-glimmer-component-classes */
import Component from '@glimmer/component';

interface Sig {
  Blocks: {
    default: string;
  };
}

/**
 * This is just a workaround component for the lack of availability of the
 * uniqueId helper in 4.12 template imports
 */
export default class WithUniqueIdComponent extends Component<Sig> {}
