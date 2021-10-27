import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import {CopyEvent, CutEvent, PasteEvent} from "@lblod/ember-rdfa-editor/core/editor-events";
import {action} from '@ember/object';
import {MisbehavedSelectionError, UninitializedError} from "@lblod/ember-rdfa-editor/util/errors";
import PasteCommand from "clipboard-plugin/commands/paste-command";
import CutCommand from "clipboard-plugin/commands/cut-command";
import CopyCommand from "clipboard-plugin/commands/copy-command";

export default class ClipboardPlugin implements EditorPlugin {
  private _controller?: EditorController;

  get name(): string {
    return 'clipboard';
  }

  static create() {
    return new ClipboardPlugin();
  }

  get controller(): EditorController {
    if (!this._controller) {
      throw new UninitializedError();
    }
    return this._controller;

  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController) {
    controller.onEvent("paste", this.paste);
    controller.onEvent("cut", this.cut);
    controller.onEvent("copy", this.copy);
    controller.registerCommand(PasteCommand);
    controller.registerCommand(CutCommand);
    controller.registerCommand(CopyCommand);
    this._controller = controller;
  }


  @action
  paste(event: PasteEvent) {
    const range = this.controller.selection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }
    this.controller.executeCommand("paste", {
      data: event.payload.data,
      range
    });
  }

  @action
  copy(event: CopyEvent) {
    const range = this.controller.selection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }
    this.controller.executeCommand("copy", {
      event: event.payload.domEvent,
      range
    });

  }

  @action
  cut(event: CutEvent) {
    const range = this.controller.selection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }
    this.controller.executeCommand("cut", {
      event: event.payload.domEvent,
      range
    });

  }

}
