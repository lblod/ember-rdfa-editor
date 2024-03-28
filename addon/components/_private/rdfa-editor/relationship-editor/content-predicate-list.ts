import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const ThreeDotsIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/three-dots')
      .ThreeDotsIcon
  : 'three-dots';
const BinIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/bin').BinIcon
  : 'bin';

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
