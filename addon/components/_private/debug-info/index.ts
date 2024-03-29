import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const ChevronDownIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/chevron-down')
      .ChevronDownIcon
  : 'chevron-down';
const ChevronUpIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/chevron-up')
      .ChevronUpIcon
  : 'chevron-up';

type Args = {
  node: ResolvedPNode;
};
export default class DebugInfo extends Component<Args> {
  ChevronDownIcon = ChevronDownIcon;
  ChevronUpIcon = ChevronUpIcon;

  @tracked collapsed = false;

  get pos() {
    return this.args.node.pos;
  }

  get nodeType() {
    return this.args.node.value.type.name;
  }

  toggleSection = () => {
    this.collapsed = !this.collapsed;
  };
}
