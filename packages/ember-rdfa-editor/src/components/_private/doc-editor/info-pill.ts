import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import AttributeEditor from '../attribute-editor/index.gts';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types.ts';
import RdfaEditor from '../rdfa-editor/index.gts';
import type SayController from '@lblod/ember-rdfa-editor/core/say-controller.ts';

type Args = {
  controller?: SayController;
};

export default class DocumentInfoPill extends Component<Args> {
  AttributeEditor = AttributeEditor;
  RdfaEditor = RdfaEditor;
  @tracked
  modalOpen = false;

  get controller() {
    return this.args.controller;
  }

  showModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    this.modalOpen = false;
  };

  get doc(): ResolvedPNode | undefined {
    if (this.controller) {
      return { pos: -1, value: this.controller.mainEditorState.doc };
    }
    return;
  }
}
