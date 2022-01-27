import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/model/controller';

export default class DummyPlugin implements EditorPlugin {
  private controller?: Controller;

  async initialize(controller: Controller): Promise<void> {
    this.controller = controller;
  }

  get name(): string {
    return 'dummy';
  }
}
