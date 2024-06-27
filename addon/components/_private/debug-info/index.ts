import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';

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
