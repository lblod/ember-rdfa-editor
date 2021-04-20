import { InputHandler } from './input-handler';
import RawEditor from "@lblod/ember-rdfa-editor/utils/ce/raw-editor";


/**
 * BoldItalicUnderlineHandler, a event handler to handle the generic enter case
 *
 * @module contenteditable-editor
 * @class EnterHandler
 * @constructor
 */
export default class EnterHandler implements InputHandler {

  rawEditor: RawEditor;

  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    this.rawEditor = rawEditor;
  }

  isHandlerFor(event: Event) {
    return event.type === "keydown" && (event as KeyboardEvent).key === "Enter";
  }


  handleEvent(_event: Event) {
    console.log("enter")
    //TODO (sergey):this is hacky and very quick should be redone
    if(this.rawEditor.canExecuteCommand('insert-newLi')){
      this.rawEditor.executeCommand('insert-newLi');
      return {allowPropagation: false, allowBrowserDefault: false};
    }
    else if(this.rawEditor.canExecuteCommand('insert-newLine')){
      this.rawEditor.executeCommand('insert-newLine');
      return {allowPropagation: false, allowBrowserDefault: false};
    }
    else{
      return {allowPropagation: true, allowBrowserDefault: true};
    }
  }
}
