import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

type Args = {
  node: ResolvedPNode;
};
export default class DebugInfo extends Component<Args> {
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
