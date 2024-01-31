import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

interface Args {
  properties: OutgoingTriple[];
  addProperty: (property: OutgoingTriple) => void;
  removeProperty: (index: number) => void;
}
export default class ContentPredicateListComponent extends Component<Args> {
  @tracked
  newPredicate = '';
  get contentPredicates() {
    return this.args.properties
      .map((prop, index) => ({ prop, index }))
      .filter((entry) => entry.prop.object.termType === 'ContentLiteral');
  }
}
