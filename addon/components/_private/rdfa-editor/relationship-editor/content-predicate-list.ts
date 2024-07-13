import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';

interface Args {
  properties: OutgoingTriple[];
  addProperty: (property: OutgoingTriple) => void;
  removeProperty: (index: number) => void;
}
export default class ContentPredicateListComponent extends Component<Args> {
  ThreeDotsIcon = ThreeDotsIcon;
  BinIcon = BinIcon;

  @tracked
  newPredicate = '';
  get contentPredicates() {
    return this.args.properties
      .map((prop, index) => ({ prop, index }))
      .filter((entry) => entry.prop.object.termType === 'ContentLiteral');
  }
}
