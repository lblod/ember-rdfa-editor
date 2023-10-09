import Component from '@glimmer/component';
import { OutgoingProp } from '@lblod/ember-rdfa-editor/core/say-parser';
import { ResolvedNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';

type Args = {
  onClose: () => void;
  node: ResolvedNode;
};
export default class PropertyEditorModal extends Component<Args> {
  saveChanges = () => {
    this.args.onClose();
  };

  cancel = () => {
    this.args.onClose();
  };

  get attributeProperties() {
    const properties = this.args.node.value.attrs.properties as
      | Record<string, OutgoingProp>
      | undefined;
    if (properties) {
      const filteredEntries = Object.entries(properties).filter(
        ([_, prop]) => prop.type === 'attr',
      );
      return Object.fromEntries(filteredEntries);
    } else {
      return;
    }
  }
}
