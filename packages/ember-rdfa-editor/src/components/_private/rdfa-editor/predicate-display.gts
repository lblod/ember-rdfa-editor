import Component from '@glimmer/component';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';

interface Sig {
  Args: {
    prop: OutgoingTriple;
  };
}

export default class PredicateDisplay extends Component<Sig> {
  get displayName() {
    // TODO add configurable way to get more user friendly value
    return this.args.prop.predicate;
  }

  <template>
    <p><strong>predicate:</strong> {{this.displayName}}</p>
  </template>
}
