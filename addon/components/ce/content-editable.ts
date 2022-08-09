import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { createEditorView } from '@lblod/ember-rdfa-editor/core/editor';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';
import { EditorInputHandler } from '../../input/input-handler';
import { ResolvedPluginConfig } from '../rdfa/rdfa-editor';
import { Dispatch, View } from '@lblod/ember-rdfa-editor/core/view';
import { createNewStateFromHtmlElement } from '@lblod/ember-rdfa-editor/core/state';
import { ViewController } from '@lblod/ember-rdfa-editor/model/controller';

interface FeatureService {
  isEnabled(key: string): boolean;
}

interface ContentEditableArgs {
  editorInit(editor: View): void;

  plugins: ResolvedPluginConfig[];

  baseIRI?: string;

  stealFocus?: boolean;

  initialContent?: string;

  dispatch?: Dispatch;
}

/**
 * content-editable is the core of {{#crossLinkModule "rdfa-editor"}}rdfa-editor{{/crossLinkModule}}.
 * It provides handlers for input events, a component to display a content editable element and an API for interaction
 * with the document and its internal document representation.
 *
 * rdfa-editor embeds the {{#crossLink "ContentEditable"}}{{/crossLink}} and interacts with the document
 * through the {{#crossLink "RawEditor"}}{{/crossLink}} interface.
 *
 * Input is handled by input handlers such as the {{#crossLink "TextInputHandler"}}{{/crossLink}},
 * {{#crossLink "BackspaceHandler"}}{{/crossLink}}, {{#crossLink "ArrowHandler"}}{{/crossLink}} and
 * {{#crossLink "EnterHandler"}}{{/crossLink}}.
 * @module contenteditable-editor
 * @main contenteditable-editor
 */

/**
 * Content editable editor component.
 * @module contenteditable-editor
 * @class ContentEditableComponent
 * @extends Component
 */
export default class ContentEditable extends Component<ContentEditableArgs> {
  inputHandler: EditorInputHandler | null = null;

  @service declare features: FeatureService;

  get stealFocus(): boolean {
    return this.args.stealFocus || false;
  }

  @action
  afterSelectionChange() {
    if (this.inputHandler) {
      this.inputHandler.afterSelectionChange();
    }
  }

  @action
  beforeInput(event: InputEvent) {
    if (this.inputHandler) {
      this.inputHandler.beforeInput(event);
    }
  }

  @action
  afterInput(event: InputEvent) {
    if (this.inputHandler) {
      this.inputHandler.afterInput(event);
    }
  }

  @action
  keydown(event: KeyboardEvent) {
    if (this.inputHandler) {
      this.inputHandler.keydown(event);
    }
  }

  @action
  paste(event: ClipboardEvent) {
    if (this.inputHandler) {
      this.inputHandler.paste(
        event,
        this.features.isEnabled('editor-html-paste'),
        this.features.isEnabled('editor-extended-html-paste')
      );
    }
  }

  @action
  cut(event: ClipboardEvent) {
    if (this.inputHandler) {
      this.inputHandler.cut(event);
    }
  }

  @action
  copy(event: ClipboardEvent) {
    if (this.inputHandler) {
      this.inputHandler.copy(event);
    }
  }

  @action
  dragstart(event: DragEvent) {
    throw new NotImplementedError(`Event not handled: ${event.type}`);
  }

  /**
   * "didRender" hook: Makes sure the element is focused and calls the rootNodeUpdated action.
   *
   * @method insertedEditorElement
   */
  @action
  async insertedEditorElement(element: HTMLElement) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    document.addEventListener('selectionchange', this.afterSelectionChange);
    const initialState = createNewStateFromHtmlElement(element);
    const editorView = await createEditorView({
      domRoot: element,
      plugins: this.args.plugins,
      initialState,
    });
    this.inputHandler = new EditorInputHandler(
      new ViewController('input', editorView)
    );
    this.args.editorInit(editorView);
    if (this.stealFocus) {
      element.focus();
    }
  }

  @action
  teardown() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    document.removeEventListener('selectionchange', this.afterSelectionChange);
  }
}
