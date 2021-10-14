import {action} from "@ember/object";
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import Editor, {EditorImpl} from "@lblod/ember-rdfa-editor/core/editor";
import {UninitializedError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import {KeydownEvent, SelectionChangedEvent} from "@lblod/ember-rdfa-editor/core/editor-events";

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
  constructor(owner: unknown, args: ContentEditableArgs) {
    super(owner, args);
    document.addEventListener("selectionchange", this.handleSelectionChange);
    // const rawEditor = PernetRawEditor.create({});
    // rawEditor.registerMovementObserver(new LumpNodeMovementObserver());
    //
    // this._rawEditor = rawEditor;
    // this.defaultHandlers = [
    //   new ArrowHandler({ rawEditor }),
    //   new EnterHandler({ rawEditor }),
    //   new BackspaceHandler({ rawEditor }),
    //   new TabHandler({ rawEditor }),
    //   new TextInputHandler({ rawEditor }),
    //   new DisableDeleteHandler({ rawEditor }),
    //   new IgnoreModifiersHandler({ rawEditor }),
    //   new UndoHandler({ rawEditor }),
    //   new BoldItalicUnderlineHandler({ rawEditor }),
    //   new EscapeHandler({ rawEditor }),
    //   new FallbackInputHandler({ rawEditor }),
    // ];
    //
    // this.externalHandlers = this.args.externalHandlers ? this.args.externalHandlers : [];
    // this.cutHandler = new CutHandler({rawEditor});
    // this.copyHandler = new CopyHandler({rawEditor});
    // this.pasteHandler = new PasteHandler({rawEditor});
  }

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
  handleKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    this.editor.emitEvent(new KeydownEvent(event, CE_OWNER));
  }

  @action
  handleSelectionChange() {
    this.editor.emitEvent(new SelectionChangedEvent(CE_OWNER));
  }
  willDestroy() {
    this.editor.onDestroy();
  }


  // cutHandler: InputHandler;
  // copyHandler: InputHandler;
  // pasteHandler: InputHandler;
  //
  // _rawEditor: PernetRawEditor;
  //
  // /**
  //  * Element of the component. It is aliased to the rawEditor.rootElement.
  //  *
  //  * @property element
  //  * @type HTMLElement
  //  *
  //  * @private
  //  */
  // @tracked rootElement: HTMLElement | null = null;
  //
  // /**
  //  *
  //  * @property rawEditor
  //  * @type RawEditor
  //  */
  // get rawEditor(): PernetRawEditor {
  //   if (!this._rawEditor) {
  //     throw new IllegalAccessToRawEditor();
  //   }
  //   return this._rawEditor;
  // }
  //
  // /**
  //  * Ordered set of input handlers.
  //  * @property eventHandlers
  //  * @type Array
  //  * @public
  //  */
  // get inputHandlers(): InputHandler[] {
  //   return this.externalHandlers.concat(this.defaultHandlers);
  // }
  //
  // /**
  //  * Default input handlers.
  //  * @property defaultHandlers
  //  * @type Array
  //  * @private
  //  */
  // @tracked defaultHandlers: InputHandler[];
  //
  // /**
  //  * External input handlers.
  //  * @property externalHandlers
  //  * @type Array
  //  * @private
  //  */
  // externalHandlers: InputHandler[];
  //
  //
  // /**
  //  * the following block handles input, as it's taken some research I'll dump some knowledge and assumptions here
  //  * take this with a grain of salt, because the spec is somewhat unclear and not all browser implement the same order:
  //  *
  //  * Chain 1: (regular input)
  //  * keydown (captured if you want to prevent the key from doing something do it here, preventdefault will prevent keypress and input from firing)
  //  * keypress (we ignore this, it's badly spec'ed and behaves differently in different browsers)
  //  * beforeinput (sometimes captured, has potential, because it can replace the entire keydown/keypress mess. currently only in chrome)
  //  * keyup (we should ignore this, because it fires even if keydown does a preventDefault. however it is one of the few places we can capture page up, page down, arrow up and down so we capture those here using the fallback input handler)
  //  * input (captured, input has happened and all you can do is clean up)
  //  *
  //  * Chain 2 (in FF input fires after compositionend): compositions (mostly on mac)
  //  * compositionupdate (we ignore this)
  //  * input (we capture this)
  //  * compositionend (we capture this, if input has preventdefault this doesn't fire. not well tested)
  //  *
  //  * Chain 3: copy, cut, paste (may be broken if event order changes)
  //  * keydown (captured, we try to ignore the event here and let it bubble)
  //  * keypress (we ignore this, see above)
  //  * keyup (we ignore this, see above)
  //  * paste/copy/cut/undo (we capture these)
  //  * input (prevent default prevents this one from triggering)
  //  */
  //
  // /**
  //  * keyDown events are handled for simple input we take over from
  //  * browser input.
  //  */
  // @action
  // handleKeyDown(event: KeyboardEvent) {
  //   if (!this.keydownMapsToOtherEvent(event)) {
  //     const preventDefault = this.passEventToHandlers(event);
  //     if (preventDefault) {
  //       event.preventDefault();
  //     }
  //   }
  // }
  //
  // /**
  //  * keyUp events are handled for simple input we take over from
  //  * browser input.
  //  */
  // @action
  // handleKeyUp(event: KeyboardEvent) {
  //   const preventDefault = this.passEventToHandlers(event);
  //   if (preventDefault) {
  //     event.preventDefault();
  //   }
  // }
  //
  // /**
  //  * reading of blogs and part of the spec seems to indicate capture input is the safest way to capture input
  //  * this method is only called for input that hasn't been handled in earlier events (like keydown)
  //  */
  // @action
  // handleInput(event: InputEvent) {
  //   const preventDefault = this.passEventToHandlers(event);
  //   if (preventDefault) {
  //     event.preventDefault();
  //   }
  // }
  //
  // @action
  // beforeInput(event: InputEvent) {
  //   const preventDefault = this.passEventToHandlers(event);
  //   if (preventDefault) {
  //     event.preventDefault();
  //   }
  // }
  //
  // /**
  //  * compositionEnd events are parsed for complex input, for uncaptured events we update
  //  * the internal state to be inline with reality
  //  */
  // @action
  // compositionEnd(event: CompositionEvent) {
  //   const preventDefault = this.passEventToHandlers(event);
  //   if (preventDefault) {
  //     event.preventDefault();
  //   }
  // }
  //
  // @action
  // paste(event: ClipboardEvent) {
  //   event.preventDefault();
  //   this.pasteHandler.handleEvent(
  //     event,
  //     this.features.isEnabled("editor-html-paste"),
  //     this.features.isEnabled("editor-extended-html-paste")
  //   );
  // }
  //
  // @action
  // cut(event: ClipboardEvent) {
  //   event.preventDefault();
  //   if (this.features.isEnabled("editor-cut")) {
  //     this.cutHandler.handleEvent(event);
  //   }
  // }
  //
  // @action
  // copy(event: ClipboardEvent) {
  //   event.preventDefault();
  //   if (this.features.isEnabled("editor-copy")) {
  //     this.copyHandler.handleEvent(event);
  //   }
  // }
  //
  // @action
  // handleMouseUp(event: MouseEvent) {
  //   const preventDefault = this.passEventToHandlers(event);
  //   if (preventDefault) {
  //     event.preventDefault();
  //   }
  // }
  //
  // @action
  // handleMouseDown(/* event: MouseEvent */) {
  //   // not handling just yet
  // }
  //
  // /**
  //  * dragstart isn't allowed at the moment
  //  */
  // @action
  // dragstart(event: MouseEvent) {
  //   event.preventDefault();
  // }
  //
  // /**
  //  * passes an event to handlers and returns whether the event default should be prevented or not
  //  * @method passEventToHandlers
  //  * @return {Boolean}
  //  * @private
  //  */
  // passEventToHandlers(event: Event): boolean {
  //   const handlers = this.inputHandlers.filter(h => h.isHandlerFor(event));
  //   if (handlers.length > 0) {
  //     let preventDefault = false;
  //     for (const handler of handlers) {
  //       const handlerResponse: HandlerResponse = handler.handleEvent(event);
  //       if (!handlerResponse.allowBrowserDefault) {
  //         // if one handler decided the event default (e.g. browser bubbling) should be prevented we do so.
  //         preventDefault = true;
  //       }
  //       if (!handlerResponse.allowPropagation) {
  //         // handler does not allow this event to be passed to other handlers return immediately
  //         break;
  //       }
  //     }
  //     // eslint-disable-next-line @typescript-eslint/unbound-method
  //     void taskFor(this.rawEditor.generateDiffEvents).perform();
  //     this.rawEditor.model.read();
  //     return preventDefault;
  //   }
  //   else {
  //     this.rawEditor.model.read();
  //     return false;
  //   }
  // }
  //
  // /**
  //  * Tries to find and identify common keyboard shortcuts which emit other events we can tap into.
  //  * Currently tries to catch copy, paste, cut. Definitely needs testing on mac.
  //  * @method keydownMapsToOtherEvent
  //  */
  // keydownMapsToOtherEvent(event: KeyboardEvent) : boolean {
  //   return (event.ctrlKey || event.metaKey) && ["v", "c", "x"].includes(event.key);
  // }
}
