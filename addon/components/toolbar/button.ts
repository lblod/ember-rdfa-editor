import Component from '@glimmer/component';
import { type ComponentLike } from '@glint/template';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const ChevronDownIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/chevron-down')
      .ChevronDownIcon
  : 'chevron-down';

type Args = {
  icon: ComponentLike;
  optionsIcon: ComponentLike;
};

export default class ToolbarButton extends Component<Args> {
  get optionsIcon() {
    return this.args.optionsIcon ?? ChevronDownIcon;
  }
}
