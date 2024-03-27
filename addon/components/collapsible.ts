import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { RemoveIcon } from '@appuniversum/ember-appuniversum/components/icons/remove';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';

type Args = { expandedInitially?: boolean };
export default class CollapsibleComponent extends Component<Args> {
  RemoveIcon = RemoveIcon;
  AddIcon = AddIcon;

  @tracked _expanded: boolean | null = null;

  get expanded() {
    return this._expanded ?? this.args.expandedInitially;
  }

  @action
  toggle() {
    this._expanded = !this.expanded;
  }
}
