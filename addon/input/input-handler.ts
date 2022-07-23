import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import { handleUndo } from '@lblod/ember-rdfa-editor/input/history';
import {
  handleInsertLineBreak,
  handleInsertListItem,
  handleInsertText,
} from '@lblod/ember-rdfa-editor/input/insert';
import { mapKeyEvent } from '@lblod/ember-rdfa-editor/input/keymap';
import SelectionReader from '@lblod/ember-rdfa-editor/model/readers/selection-reader';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import Controller, { EditorController } from '../model/controller';
import { NotImplementedError } from '../utils/errors';
import handleCutCopy from './cut-copy';
import { handleDelete } from './delete';
import handlePaste from './paste';

/**
 * Represents an object which collects all the various dom-events
 * that are needed to respond to user input
 * */
export interface InputHandler {
  keydown(event: KeyboardEvent): void;
  dragstart(event: DragEvent): void;

  /**
   * Handles the (relatively) new "beforeinput" events as specified here:
   * https://www.w3.org/TR/input-events-1/#events-inputevents
   * There are fired _before_ the browser handles a user input and describe what the
   * browser is planning to do in a much more descriptive way than handling bare keyboardevents
   *
   * Using these to capture input is always preferred if possible
   * */
  beforeInput(event: InputEvent): void;
  afterInput(event: InputEvent): void;

  /**
   * Corresponds to the "selectionstart" event
   * */
  beforeSelectionChange(event: Event): void;
  afterSelectionChange(event: Event): void;
}

export class EditorInputHandler implements InputHandler {
  private editor: Editor;
  private inputController: Controller;

  constructor(editor: Editor) {
    this.editor = editor;
    this.inputController = new EditorController('inputController', editor);
  }
  keydown(event: KeyboardEvent) {
    mapKeyEvent(this.editor, event);
  }
  dragstart(event: DragEvent) {
    event.preventDefault();
  }
  paste(
    event: ClipboardEvent,
    pasteHTML?: boolean,
    pasteExtendedHTML?: boolean
  ) {
    event.preventDefault();
    handlePaste(this.inputController, event, pasteHTML, pasteExtendedHTML);
  }

  cut(event: ClipboardEvent) {
    event.preventDefault();
    handleCutCopy(this.editor, event, true);
  }

  copy(event: ClipboardEvent) {
    event.preventDefault();
    handleCutCopy(this.editor, event, false);
  }

  afterInput(event: InputEvent): void {
    throw new NotImplementedError(`Did not handle ${event.type}`);
  }

  beforeInput(event: InputEvent): void {
    console.log('handling beforeInput with type', event.inputType);
    switch (event.inputType) {
      case 'insertText':
        handleInsertText(this.editor, event);
        break;
      case 'insertReplacementText':
        handleInsertText(this.editor, event);
        break;
      case 'insertLineBreak':
        handleInsertLineBreak(this.editor, event);
        break;
      case 'insertParagraph':
        handleInsertLineBreak(this.editor, event);
        break;
      case 'insertOrderedList':
        handleInsertListItem(this.editor, event, 'ol');
        break;
      case 'insertUnorderedList':
        handleInsertListItem(this.editor, event, 'ul');
        break;
      case 'insertHorizontalRule':
        break;
      case 'insertCompositionText':
        break;
      case 'insertFromPaste':
        break;
      case 'deleteWordBackward':
        handleDelete(this.editor, event, -1);
        break;
      case 'deleteWordForward':
        handleDelete(this.editor, event, 1);
        break;
      case 'deleteSoftLineBackward':
        break;
      case 'deleteSoftLineForward':
        event.preventDefault();
        break;
      case 'deleteEntireSoftLine':
        break;
      case 'deleteHardLineBackward':
        break;
      case 'deleteHardLineForward':
        event.preventDefault();
        break;
      case 'deleteContent':
        event.preventDefault();
        break;
      case 'deleteContentBackward':
        handleDelete(this.editor, event, -1);
        break;
      case 'deleteContentForward':
        handleDelete(this.editor, event, 1);
        break;
      case 'historyUndo':
        handleUndo(this.editor, event);
        break;
      case 'historyRedo':
        event.preventDefault();
        break;

      default:
        console.warn('Unhandled beforeinput event type:', event.inputType);
        break;
    }
  }

  beforeSelectionChange(event: Event): void {
    throw new NotImplementedError(`did not handle ${event.type}`);
  }

  afterSelectionChange(): void {
    console.log('handling selectionChanged');
    const currentSelection = getWindowSelection();
    const viewRoot = this.editor.view.domRoot;
    if (
      !viewRoot.contains(currentSelection.anchorNode) ||
      !viewRoot.contains(currentSelection.focusNode) ||
      (currentSelection.type != 'Caret' &&
        viewRoot === currentSelection.anchorNode &&
        currentSelection.anchorOffset === currentSelection.focusOffset)
    ) {
      return;
    }
    const selectionReader = new SelectionReader();
    const newSelection = selectionReader.read(
      this.editor.state,
      this.editor.view.domRoot,
      currentSelection
    );
    if (!this.editor.state.selection.sameAs(newSelection)) {
      const tr = this.editor.state.createTransaction();
      tr.setSelection(newSelection);
      this.editor.dispatchTransaction(tr, false);
    }
  }
}
