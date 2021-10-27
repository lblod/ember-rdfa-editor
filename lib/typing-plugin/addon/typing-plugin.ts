import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import InsertTextCommand from "./commands/insert-text-command";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import { InsertTextEvent, KeydownEvent} from "@lblod/ember-rdfa-editor/core/editor-events";
import { action } from '@ember/object';

export default class TypingPlugin implements EditorPlugin {
  private controller!: EditorController;

  static create(): TypingPlugin {
    return new TypingPlugin();
  }

  get name(): string {
    return "typing";
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(InsertTextCommand);
    controller.onEvent("insertText", this.handleInsertText);
    this.controller = controller;
  }

  @action
  handleInsertText(event: InsertTextEvent) {
    if (this.isHandlerFor(event.payload)) {
      if(!this.handleAnchors(event.payload.data!)) {
        this.controller.executeCommand("insert-text", event.payload.data!);
      }
    }
  }

  isHandlerFor(event: InputEvent): boolean {
    // Still composing, don't handle this.
    return !event.isComposing
  }

  // TODO just a quick and dirty conversion, we might wanna come up with a more
  // structured approach
  handleAnchors(content: string): boolean {
    const clonedRange = this.controller.selection.lastRange?.clone();
    if (clonedRange) {
      const collapsed = clonedRange.collapsed;
      const {start, end, start: {parent: startParent}, end: {parent: endParent}} = clonedRange;

      let anyAnchors = false;
      if (startParent.type === "a" && start.parentOffset === 0) {
        anyAnchors = true;
        clonedRange.start = ModelPosition.fromBeforeNode(startParent);
        if (collapsed) {
          clonedRange.collapse(true);
        }
      }

      if (endParent.type === "a" && end.parentOffset === endParent.getMaxOffset()) {
        anyAnchors = true;
        clonedRange.end = ModelPosition.fromAfterNode(endParent);
        if (collapsed) {
          clonedRange.collapse();
        }
      }
      if (anyAnchors) {
        this.controller.executeCommand("insert-text", content, clonedRange);
        return true;
      }

    }
    return false;

  }

}
