import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import { handleUndo } from '@lblod/ember-rdfa-editor/input/history';
import {
  handleInsertLineBreak,
  handleInsertListItem,
  handleInsertText,
} from '@lblod/ember-rdfa-editor/input/insert';
import { mapKeyEvent } from '@lblod/ember-rdfa-editor/input/keymap';
import SelectionReader from '@lblod/ember-rdfa-editor/model/readers/selection-reader';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { InputPlugin } from '../editor/input-handlers/input-handler';
import {
  Manipulation,
  ManipulationExecutor,
} from '../editor/input-handlers/manipulation';
import { editorDebug } from '../editor/utils';
import handleCutCopy from './cut-copy';
import BackspaceHandler from './delete';
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
  private backSpaceHandler: BackspaceHandler;

  constructor(editor: Editor) {
    this.editor = editor;
    this.backSpaceHandler = new BackspaceHandler({ editor });
  }
  keydown(event: KeyboardEvent) {
    mapKeyEvent(this.editor, event);
  }
  dragstart(event: DragEvent) {
    event.preventDefault();
  }

  //TODO: pass pasteHTML arguments
  paste(event: ClipboardEvent) {
    event.preventDefault();
    handlePaste(this.editor, event);
  }

  cut(event: ClipboardEvent) {
    event.preventDefault();
    handleCutCopy(this.editor, event, true);
  }

  copy(event: ClipboardEvent) {
    event.preventDefault();
    handleCutCopy(this.editor, event, false);
  }

  afterInput(event: InputEvent): void {}

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
        event.preventDefault();
        break;
      case 'deleteWordForward':
        event.preventDefault();
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
        this.backSpaceHandler.handleEvent(event);
        break;
      case 'deleteContentForward':
        event.preventDefault();
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

  beforeSelectionChange(event: Event): void {}

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
    const tr = new Transaction(this.editor.state);
    tr.setSelection(newSelection);
    tr.needsToWrite = false;
    this.editor.dispatchTransaction(tr, false);
  }
}

/**
 * Checks whether all plugins agree the manipulation is allowed.
 *
 * This method asks each plugin individually if the manipulation is
 * allowed. If it is not allowed by *any* plugin, it yields a
 * negative response, otherwise it yields a positive response.
 *
 * We expect this method to be extended in the future with more rich
 * responses from plugins. Something like "skip" or "merge" to
 * indicate this manipulation should be lumped together with a
 * previous manipulation. Plugins may also want to execute the
 * changes themselves to ensure correct behaviour.
 *
 * @function checkManipulationByPlugins
 *
 * @param {Editor} editor
 * @param {Manipulation} manipulation DOM manipulation which will be
 * checked by plugins.
 * @param {InputPlugin[]} plugins The plugins which need to check the DOM manipulation
 *
 **/
export function checkManipulationByPlugins(
  editor: Editor,
  manipulation: Manipulation,
  plugins: InputPlugin[]
): {
  mayExecute: boolean;
  dispatchedExecutor: ManipulationExecutor | null;
} {
  // Calculate reports submitted by each plugin.
  const reports: Array<{
    plugin: InputPlugin;
    allow: boolean;
    executor: ManipulationExecutor | undefined;
  }> = [];
  for (const plugin of plugins) {
    const guidance = plugin.guidanceForManipulation(manipulation, editor);
    if (guidance) {
      const allow = guidance.allow === undefined ? true : guidance.allow;
      const executor = guidance.executor;

      reports.push({ plugin, allow, executor });
    }
  }

  // Filter reports based on our interests.
  const reportsNoExecute = reports.filter(({ allow }) => !allow);
  const reportsWithExecutor = reports.filter(({ executor }) => executor);

  // Debug reporting.
  if (reports.length > 1) {
    console.warn(`Multiple plugins want to alter this manipulation`, reports);
  }

  if (reportsNoExecute.length > 1 && reportsWithExecutor.length > 1) {
    console.error(
      `Some plugins don't want execution, others want custom execution`,
      {
        reportsNoExecute,
        reportsWithExecutor,
      }
    );
  }

  if (reportsWithExecutor.length > 1) {
    console.warn(
      `Multiple plugins want to execute this plugin. First entry in the list wins: ${reportsWithExecutor[0].plugin.label}`
    );
  }

  for (const { plugin } of reportsNoExecute) {
    editorDebug(
      `checkManipulationByPlugins`,
      `Was not allowed to execute text manipulation by plugin ${plugin.label}`,
      { manipulation, plugin }
    );
  }

  // Yield result.
  return {
    mayExecute: reportsNoExecute.length === 0,
    dispatchedExecutor: reportsWithExecutor.length
      ? (reportsWithExecutor[0].executor as ManipulationExecutor)
      : null,
  };
}
