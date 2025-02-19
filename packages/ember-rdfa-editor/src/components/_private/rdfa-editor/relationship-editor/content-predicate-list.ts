import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { OutgoingTriple } from '#root/core/rdfa-processor.ts';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';

interface Args {
  properties: OutgoingTriple[];
  removeProperty: (index: number) => void;
}
export default class ContentPredicateList extends Component<Args> {
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
