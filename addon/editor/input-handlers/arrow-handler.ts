import {InputHandler} from "@lblod/ember-rdfa-editor/editor/input-handlers/input-handler";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers";
import {HandlerResponse} from "@lblod/ember-rdfa-editor/editor/input-handlers/handler-response";

export default class ArrowHandler extends InputHandler {
  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    super(rawEditor);
  }

  isHandlerFor(event: Event): boolean {
    return isKeyDownEvent(event)
      && (event.key === "ArrowLeft" || event.key === "ArrowRight")
      && !!this.rawEditor.selection.isCollapsed;
  }

  handleEvent(event: KeyboardEvent): HandlerResponse {
    if (event.key === "ArrowLeft") {
      this.rawEditor.executeCommand("move-left");
    } else if (event.key === "ArrowRight") {
      this.rawEditor.executeCommand("move-right");
    }

    return {allowPropagation: false, allowBrowserDefault: false};
  }
}
