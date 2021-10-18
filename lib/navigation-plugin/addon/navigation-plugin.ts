import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import handleTab from 'navigation-plugin/handlers/handle-tab'
import handleArrow from 'navigation-plugin/handlers/handle-arrow'
import { action } from "@ember/object";
import {KeydownEvent} from "@lblod/ember-rdfa-editor/archive/utils/event-bus";
import MoveToNextElement from "navigation-plugin/commands/move-to-next-element-command";
import MoveToPreviousElement from "navigation-plugin/commands/move-to-previous-element";
import MoveCursorToTheRight from "navigation-plugin/commands/move-cursor-to-the-right";
import MoveCursorToTheLeft from "navigation-plugin/commands/move-cursor-to-the-left";

export default class TablesPlugin implements EditorPlugin {
  private controller!: EditorController;
  static create(): TablesPlugin {
    return new TablesPlugin();
  }

  get name() {
    return "navigation";
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(MoveToNextElement);
    controller.registerCommand(MoveToPreviousElement);
    controller.registerCommand(MoveCursorToTheRight);
    controller.registerCommand(MoveCursorToTheLeft);
    controller.onEvent("keyDown", this.handleKeydown);
    this.controller = controller;
  }

  @action
  handleKeydown(event: KeydownEvent) {
    const eventPayload = event.payload;
    // Still composing, don't handle this.
    if(eventPayload.isComposing) return;

    if (eventPayload.key === "Tab") {
      const reverse = eventPayload.shiftKey;
      handleTab(reverse, this.controller);
    } else if(eventPayload.key === 'ArrowRight'){
      handleArrow(false, this.controller);
    } else if(eventPayload.key === 'ArrowLeft') {
      handleArrow(true, this.controller);
    }
  }

}
