import Component from '@glimmer/component';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { getActiveEditableBlock } from '@lblod/ember-rdfa-editor/plugins/_private/editable-block-node';

export default class EditableBlockNode extends Component<EmberNodeArgs> {
  @service declare intl: IntlService;

  get controller() {
    return this.args.controller;
  }

  get selectionInside() {
    return (
      getActiveEditableBlock(this.controller.activeEditorState)?.pos ===
      this.args.getPos()
    );
  }
}
