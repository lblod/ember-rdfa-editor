import { action } from '@ember/object';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

type Args = EmberNodeArgs & { expandedInitially?: boolean };
export default class CollapsibleComponent extends Component<Args> {
  @tracked _expanded: boolean | null = null;

  get expanded() {
    return this._expanded ?? this.args.expandedInitially;
  }

  @action
  toggle() {
    this._expanded = !this.expanded;
  }
}
