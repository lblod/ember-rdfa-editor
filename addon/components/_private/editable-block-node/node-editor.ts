import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { getActiveEditableBlock } from '@lblod/ember-rdfa-editor/plugins/_private/editable-block-node';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { Changeset, EmberChangeset } from 'ember-changeset';
import { trackedReset } from 'tracked-toolbox';
type Args = {
  controller?: SayController;
};

export default class BlockNodeEditor extends Component<Args> {
  @trackedReset<BlockNodeEditor, boolean>({
    memo: 'activeBlock',
    update: (component) => {
      component.changeset = undefined;
      return false;
    },
  })
  isEditing = false;

  @tracked changeset?: EmberChangeset;

  get controller() {
    return this.args.controller;
  }
  get activeBlock() {
    if (this.controller) {
      return getActiveEditableBlock(this.controller.activeEditorState);
    }
    return;
  }

  get activeNode() {
    return this.activeBlock?.node;
  }

  isEditable = (attr: string) => {
    //@ts-expect-error editable is not defined on attribute-spec type
    return this.activeBlock?.node.type.spec.attrs[attr].editable as
      | boolean
      | undefined;
  };

  enableEditingMode = () => {
    if (this.activeNode) {
      this.changeset = Changeset(this.activeNode.attrs);
      this.isEditing = true;
    }
  };

  saveChanges = () => {
    console.log(unwrap(this.changeset).changes);
    this.controller?.withTransaction((tr) => {
      for (const { key, value } of unwrap(this.changeset).changes) {
        tr.setNodeAttribute(unwrap(this.activeBlock).pos, key, value);
      }
      return tr;
    });
    this.isEditing = false;
    this.changeset = undefined;
  };

  updateChangeset = (attr: string, event: InputEvent) => {
    if (this.changeset) {
      this.changeset[attr] = (event.target as HTMLTextAreaElement).value;
    }
  };
}
