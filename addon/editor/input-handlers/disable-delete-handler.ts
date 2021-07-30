import {InputHandler} from "@lblod/ember-rdfa-editor/editor/input-handlers/input-handler";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers";
import {HandlerResponse} from "@lblod/ember-rdfa-editor/editor/input-handlers/handler-response";

export default class DisableDeleteHandler extends InputHandler {
  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    super(rawEditor);
  }

  isHandlerFor(event: Event): boolean {
    return isKeyDownEvent(event) && event.key === "Delete";
  }

  handleEvent(/* event: KeyboardEvent */): HandlerResponse {
    return {allowPropagation: false, allowBrowserDefault: false};
  }
}
