import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Property } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

interface Args {
  properties: Property[];
  addProperty: (property: Property) => void;
  removeProperty: (index: number) => void;
}
export default class ContentPredicateListComponent extends Component<Args> {
  @tracked
  newPredicate: string = '';
  get contentPredicates() {
    return this.args.properties
      .map((prop, index) => ({ prop, index }))
      .filter((entry) => entry.prop.type === 'content');
  }
  @action
  addContentProperty() {
    this.args.addProperty({ type: 'content', predicate: this.newPredicate });
    this.newPredicate = '';
  }
}
