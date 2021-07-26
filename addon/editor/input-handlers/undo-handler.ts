import {InputHandler} from "@lblod/ember-rdfa-editor/editor/input-handlers/input-handler";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";

export default class UndoHandler extends InputHandler {
  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    super(rawEditor);
  }

  isHandlerFor(event: KeyboardEvent) {
    return event.type == "keydown" && (event.ctrlKey || event.metaKey) && event.key == "z";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleEvent(event: KeyboardEvent) {
    this.rawEditor.undo();
    return {allowPropagation: false, allowBrowserDefault: false};
  }
}
