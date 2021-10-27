import {action} from "@ember/object";
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import Editor, {EditorImpl} from "@lblod/ember-rdfa-editor/core/editor";
import {UninitializedError} from "@lblod/ember-rdfa-editor/util/errors";
import { CopyEvent, CutEvent, PasteEvent} from "@lblod/ember-rdfa-editor/core/editor-events";
import { DeleteContentForwardEvent, DeleteContentBackwardEvent} from "@lblod/ember-rdfa-editor/core/editor-events";
import { InsertLineBreakEvent, InsertParagraphEvent, InsertTextEvent } from "@lblod/ember-rdfa-editor/core/editor-events";

interface FeatureService {
  isEnabled(key: string): boolean
}

interface ContentEditableArgs {
  editorInit(editor: Editor): Promise<void>
}

const CE_OWNER = "content-editable";

/**
 * Content editable editor component.
 * Ember component which wraps the actual contenteditable div.
 * Responsible for setting up event listeners
 * (which simply refire EditorEvents to allow custom event structures)
 * and initializing the editor instance
 *
 * @module contenteditable-editor
 * @class ContentEditableComponent
 * @extends Component
 */
export default class ContentEditable extends Component<ContentEditableArgs> {
  @service declare features: FeatureService;
  _editor?: Editor;


  /**
   * @constructor
   */
  get editor(): Editor {
    if (!this._editor) {
      throw new UninitializedError("Tried to access editor before contenteditable component was inserted");
    }
    return this._editor;
  }

  /**
   * "didRender" hook: Makes sure the element is focused and calls the rootNodeUpdated action.
   *
   * @method insertedEditorElement
   */
  @action
  async insertedEditorElement(element: HTMLElement) {
    const editor = new EditorImpl(element);
    this._editor = editor;
    await this.args.editorInit(editor);
  }

  @action
  handleInput(event: InputEvent) {
    // https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes
    if (event.inputType == "insertText") {
      event.preventDefault();
      this.editor.emitEvent(new InsertTextEvent(event, CE_OWNER))
    }
    else if (event.inputType == "deleteContentBackward") {
      event.preventDefault();
      this.editor.emitEvent(new DeleteContentBackwardEvent(event, CE_OWNER));
    }
    else if (event.inputType == "deleteContentForward") {
      event.preventDefault();
      this.editor.emitEvent(new DeleteContentForwardEvent(event, CE_OWNER));
    }
    else if (event.inputType == "insertParagraph") {
      event.preventDefault();
      this.editor.emitEvent(new InsertParagraphEvent(event, CE_OWNER));
    }
    else if (event.inputType == "insertLineBreak") {
      event.preventDefault();
      this.editor.emitEvent(new InsertLineBreakEvent(event, CE_OWNER));
    }
    else {
      console.log(`did not prevent beforeinput event of type ${event.inputType}`,event);
    }
  }

  @action
  recoverFromUnhandledInput(event: InputEvent) {
    console.log(event);
  }

  willDestroy() {
    this.editor.onDestroy();
  }

  @action
  paste(event: ClipboardEvent) {
    event.preventDefault();
    this.editor.emitEvent(new PasteEvent({
      payload: {
        domEvent: event, data: event.clipboardData,
        pasteHTML: this.features.isEnabled('editor-html-paste'),
        pasteExtendedHTML: this.features.isEnabled('editor-extended-html-paste')
      }
    }));
  }

  @action
  cut(event: ClipboardEvent) {
    event.preventDefault();
    if (this.features.isEnabled("editor-cut")) {
      this.editor.emitEvent(new CutEvent({
        payload: {
          domEvent: event
        }
      }));
    }
  }

  @action
  copy(event: ClipboardEvent) {
    event.preventDefault();
    if (this.features.isEnabled("editor-copy")) {
      this.editor.emitEvent(new CopyEvent({
        payload: {
          domEvent: event
        }
      }));
    }
  }
}
