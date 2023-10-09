import Component from '@glimmer/component';
import { ResolvedNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';

type Args = {
  node: ResolvedNode;
};
export default class DebugInfo extends Component<Args> {
  get pos() {
    return this.args.node.pos;
  }

  get nodeType() {
    return this.args.node.value.type.name;
  }
}
