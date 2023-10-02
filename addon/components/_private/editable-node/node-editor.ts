import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { getActiveEditableNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { Changeset, EmberChangeset } from 'ember-changeset';
import { NodeSelection } from 'prosemirror-state';
import { trackedReset } from 'tracked-toolbox';

type Args = {
  controller?: SayController;
};

export default class NodeEditor extends Component<Args> {
  @trackedReset<NodeEditor, boolean>({
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

  get activeNode() {
    if (this.controller) {
      return getActiveEditableNode(this.controller.activeEditorState);
    }
    return;
  }

  isEditable = (attr: string) => {
    //@ts-expect-error editable is not defined on attribute-spec type
    return this.activeNode?.node.type.spec.attrs[attr].editable as
      | boolean
      | undefined;
  };

  enableEditingMode = () => {
    if (this.activeNode) {
      this.changeset = Changeset(this.activeNode.node.attrs);
      this.isEditing = true;
    }
  };

  cancelEditing = () => {
    this.isEditing = false;
    this.changeset = undefined;
  };

  saveChanges = () => {
    this.controller?.withTransaction((tr) => {
      for (const { key, value } of unwrap(this.changeset).changes) {
        tr.setNodeAttribute(unwrap(this.activeNode).pos, key, value);
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
  formatValue = (value: unknown) => {
    return JSON.stringify(value);
  };
  goToNodeWithId = (id: string) => {
    const doc = this.controller?.mainEditorState.doc;
    if (!doc) {
      return;
    }
    let found = false;
    let resultPos = 0;
    doc.descendants((node, pos) => {
      if (found) return false;
      if (node.attrs.__rdfaId === id) {
        found = true;
        resultPos = pos;
        return false;
      }
      return true;
    });
    if (found) {
      this.controller?.withTransaction((tr) => {
        return tr
          .setSelection(new NodeSelection(tr.doc.resolve(resultPos)))
          .scrollIntoView();
      });
    }
  };
}
