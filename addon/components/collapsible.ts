import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const RemoveIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/remove')
      .RemoveIcon
  : 'remove';
const AddIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/add').AddIcon
  : 'add';

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
