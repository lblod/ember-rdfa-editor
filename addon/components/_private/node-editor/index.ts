import Component from '@glimmer/component';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { getActiveEditableNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import DebugInfo from './debug-info';
import PropertyEditor from './property-editor';
import AttributeEditor from './attribute-editor';
import RelationshipEditor from './relationship-editor';

type Args = {
  controller?: SayController;
};

export default class NodeEditor extends Component<Args> {
  DebugInfo = DebugInfo;
  PropertyEditor = PropertyEditor;
  AttributeEditor = AttributeEditor;
  RelationshipEditor = RelationshipEditor;

  get controller() {
    return this.args.controller;
  }

  get activeNode() {
    if (this.controller) {
      return getActiveEditableNode(this.controller.activeEditorState);
    }
    return;
  }
}
