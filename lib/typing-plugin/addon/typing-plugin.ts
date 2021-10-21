import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import InsertTextCommand from "./commands/insert-text-command";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import {KeydownEvent} from "@lblod/ember-rdfa-editor/core/editor-events";
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
    controller.onEvent("keyDown", this.handleKeydown);
    this.controller = controller;
  }

  @action
  handleKeydown(event: KeydownEvent) {
    if (this.isHandlerFor(event.payload)) {
      if(!this.handleAnchors(event.payload.key)) {
        this.controller.executeCommand("insert-text", event.payload.key);
      }
    }
  }

  isHandlerFor(event: KeyboardEvent): boolean {
    // Still composing, don't handle this.
    return !event.isComposing
      // It's a key combo, we don't want to do anything with this at the moment.
      && !(event.altKey || event.ctrlKey || event.metaKey)
      // Only interested in actual input, no control keys.
      && event.key.length <= 1;
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
