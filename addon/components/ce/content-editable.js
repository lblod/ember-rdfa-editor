import { layout as templateLayout } from "@ember-decorators/component";
import { tracked } from '@glimmer/tracking';
import { action } from "@ember/object";
import Component from '@ember/component';
import layout from '../../templates/components/ce/content-editable';
import forgivingAction from '../../utils/ce/forgiving-action';
import EnterHandler from '@lblod/ember-rdfa-editor/editor/input-handlers/enter-handler';
import IgnoreModifiersHandler from '../../utils/ce/handlers/ignore-modifiers-handler';
import BackspaceHandler from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import TextInputHandler from '@lblod/ember-rdfa-editor/editor/input-handlers/text-input-handler';
import TabHandler from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import DisableDeleteHandler from '@lblod/ember-rdfa-editor/utils/ce/handlers/delete-handler';
import FallbackInputHandler from '../../utils/ce/handlers/fallback-input-handler';
import BoldItalicUnderlineHandler from '@lblod/ember-rdfa-editor/editor/input-handlers/bold-italic-underline-handler';
import UndoHandler from '../../utils/ce/handlers/undo-hander';
import ArrowHandler from '../../utils/ce/handlers/arrow-handler';
import EscapeHandler from '@lblod/ember-rdfa-editor/editor/input-handlers/escape-handler';
import LumpNodeMovementObserver from '../../utils/ce/movement-observers/lump-node-movement-observer';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import LegacyRawEditor from "@lblod/ember-rdfa-editor/utils/ce/legacy-raw-editor";
import PasteHandler from "@lblod/ember-rdfa-editor/editor/input-handlers/paste-handler";
import CutHandler from "@lblod/ember-rdfa-editor/editor/input-handlers/cut-handler";
import CopyHandler from "@lblod/ember-rdfa-editor/editor/input-handlers/copy-handler";

/**
 * content-editable is the core of {{#crossLinkModule "rdfa-editor"}}rdfa-editor{{/crossLinkModule}}.
 * It provides handlers for input events, a component to display a contenteditable element and an api for interaction with the document and its internal document representation.
 *
 * rdfa-editor embeds the {{#crossLink "ContentEditableCompoment"}}{{/crossLink}} and interacts with the document through the {{#crossLink "RawEditor"}}{{/crossLink}} interface.
 *
 * input is handled by input handlers such as the {{#crossLink "TextInputHandler"}}{{/crossLink}}, {{#crossLink "BackspaceHandler"}}{{/crossLink}},
 * {{#crossLink "ArrowHandler"}}{{/crossLink}} and {{#crossLink "EnterHandler"}}{{/crossLink}}.
 * @module contenteditable-editor
 * @main contenteditable-editor
 */

/**
 * Content editable editor component
 * @module contenteditable-editor
 * @class ContentEditableComponent
 * @extends Component
 */
@templateLayout(layout)
export default class ContentEditable extends Component {
  tagName = ''
  @service features;

  pasteHandler = null;
  cutHandler = null;
  copyHandler;

  /**
   * WIP: Rich selection
   *
   * @property richSelection
   * @type Object
   *
   * @private
   */
  richSelection;

  /**
   * element of the component, it is aliased to the rawEditor.rootNode
   *
   * @property element
   * @type DOMElement
   *
   * @private
   */
  @tracked rootNode = null;

  /**
   *
   * @property rawEditor
   * @type RawEditor
   */
  @tracked rawEditor = null;

  /**
   * ordered set of input handlers
   * @property eventHandlers
   * @type Array
   * @public
   */
  get inputHandlers() {
    return this.externalHandlers.concat(this.defaultHandlers);
  }

  /**
   * default input handlers
   * @property defaultHandlers
   * @type Array
   * @private
   */
  @tracked defaultHandlers = null;

  /**
   * external input handlers
   * @property externalHandlers
   * @type Array
   * @private
   */
  externalHandlers = null;

  /**
   * @constructor
   */
  init() {
    super.init(...arguments);
    const rawEditor = LegacyRawEditor.create({ });
    rawEditor.registerMovementObserver(new LumpNodeMovementObserver());
    this.set('rawEditor', rawEditor);
    const forceParagraph = this.features.isEnabled('editor-force-paragraph');
    const defaultInputHandlers = [ new ArrowHandler({rawEditor}),
                                   new EnterHandler({rawEditor}),
                                   new BackspaceHandler({rawEditor}),
                                   new TabHandler({rawEditor}),
                                   new TextInputHandler({rawEditor, forceParagraph }),
                                   new DisableDeleteHandler({rawEditor}),
                                   new IgnoreModifiersHandler({rawEditor}),
                                   new UndoHandler({rawEditor}),
                                   new BoldItalicUnderlineHandler({rawEditor}),
                                   new EscapeHandler({rawEditor}),
                                   new FallbackInputHandler({rawEditor}),
                                 ];

    this.set('currentTextContent', '');
    this.set('defaultHandlers', defaultInputHandlers);
    this.set('capturedEvents', A());

    this.set('pasteHandler', new PasteHandler({rawEditor}));
    this.set('cutHandler', new CutHandler({rawEditor}));
    this.copyHandler = new CopyHandler({rawEditor});

    if(!this.externalHandlers) {
      this.set('externalHandlers', []);
    }
  }

  /**
   * specify whether the editor should autofocus the contenteditable field
   *
   * @property focused
   * @type boolean
   * @default false
   *
   * @public
   */
  focused = false;

  /**
   * specify whether the editor should be contenteditable
   *
   * @property editable
   * @type boolean
   * @default true
   *
   * @public
   */
  editable = true;

  /**
   * didRender hook, makes sure the element is focused
   * and calls the rootNodeUpdated action
   *
   * @method insertedEditorElement
   */
  @action
  insertedEditorElement(element) {
    this.rawEditor.rootNode =  element;
    this.rawEditor.updateRichNode();
    this.rawEditor.setCurrentPosition(0);
    this.rawEditor.generateDiffEvents.perform();
    forgivingAction('rawEditorInit', this)(this.rawEditor);
  }

  /**
   * willDestroyElement, calls the rootNodeUpdated action
   *
   * @method willDestroyElement
   *
   */
  willDestroyElement() {
    this.set('richNode', null);
    this.set('rawEditor.rootNode', null);
    forgivingAction('elementUpdate', this)();
  }

  /**
   * the following block handles input, as it's taken some research I'll dump some knowledge and assumptions here
   * take this with a grain of salt, because the spec is somewhat unclear and not all browser implement the same order:
   *
   * Chain 1: (regular input)
   * keydown (captured if you want to prevent the key from doing something do it here, preventdefault will prevent keypress and input from firing)
   * keypress (we ignore this, it's badly spec'ed and behaves differently in different browsers)
   * beforeinput (sometimes captured, has potential, because it can replace the entire keydown/keypress mess. currently only in chrome)
   * keyup (we should ignore this, because it fires even if keydown does a preventDefault. however it is one of the few places we can capture page up, page down, arrow up and down so we capture those here using the fallback input handler)
   * input (captured, input has happened and all you can do is clean up)
   *
   * Chain 2 (in FF input fires after compositionend): compositions (mostly on mac)
   * compositionupdate (we ignore this)
   * input (we capture this)
   * compositionend (we capture this, if input has preventdefault this doesn't fire. not well tested)
   *
   * Chain 3: copy, cut, paste (may be broken if event order changes)
   * keydown (captured, we try to ignore the event here and let it bubble)
   * keypress (we ignore this, see above)
   * keyup (we ignore this, see above)
   * paste/copy/cut/undo (we capture these)
   * input (prevent default prevents this one from triggering)
   */

  /**
   * keyDown events are handled for simple input we take over from
   * browser input.
   */
  @action
  handleKeyDown(event) {
    if (!this.keydownMapsToOtherEvent(event)) {
      const preventDefault = this.passEventToHandlers(event);
      if (preventDefault) {
        event.preventDefault();
      }
    }
  }

  /**
   * keyUp events are handled for simple input we take over from
   * browser input.
   */
  @action
  handleKeyUp(event) {
    const preventDefault = this.passEventToHandlers(event);
    if (preventDefault) {
      event.preventDefault();
    }
  }

  /**
   * reading of blogs and part of the spec seems to indicate capture input is the safest way to capture input
   * this method is only called for input that hasn't been handled in earlier events (like keydown)
   */
  @action
  handleInput(event) {
    const preventDefault = this.passEventToHandlers(event);
    if (preventDefault) {
      event.preventDefault();
    }
  }

  /**
   * compositionEnd events are parsed for complex input, for uncaptured events we update
   * the internal state to be inline with reality
   */
  @action
  compositionEnd(event) {
    const preventDefault = this.passEventToHandlers( event );
    if (preventDefault) {
      event.preventDefault();
    }
  }

  /**
   * paste events are parsed and handled as good as possible
   */
  @action
  paste(event) {
    event.preventDefault();
    this.pasteHandler.handleEvent(
      event,
      this.features.isEnabled("editor-html-paste"),
      this.features.isEnabled("editor-extended-html-paste")
    );
  }

  @action
  beforeInput(event) {
    const preventDefault = this.passEventToHandlers( event );
    if (preventDefault) {
      event.preventDefault();
    }
  }

  @action
  cut(event) {
    event.preventDefault();
    if (this.features.isEnabled("editor-cut")) {
      this.cutHandler.handleEvent(event);
    }
  }

  @action
  copy(event) {
    event.preventDefault();
    if (this.features.isEnabled("editor-copy")) {
      this.copyHandler.handleEvent(event);
    }
  }

  @action
  handleMouseUp(event) {
    const preventDefault = this.passEventToHandlers(event);
    if (preventDefault) {
      event.preventDefault();
    }
  }

  @action
  handleMouseDown(/* event */){
    // not handling just yet
  }

  @action
  undo( /* event */) {
    this.rawEditor.undo();
  }

  /**
   * passes an event to handlers and returns whether the event default should be prevented or not
   * @method passEventToHandlers
   * @param {DOMEvent} event
   * @return {Boolean}
   * @private
   */
  passEventToHandlers(event) {
    const handlers = this.inputHandlers.filter(h => h.isHandlerFor(event));
    if (handlers.length > 0) {
      let preventDefault = false;
      for (let handler of handlers) {
        const handlerResponse = handler.handleEvent(event);
        if (!handlerResponse.allowBrowserDefault) {
          // if one handler decided the event default (e.g. browser bubbling) should be prevented we do so.
          preventDefault = true;
        }
        if (!handlerResponse.allowPropagation) {
          // handler does not allow this event to be passed to other handlers return immediately
          break;
        }
      }
      this.rawEditor.generateDiffEvents.perform();
      this.rawEditor.model.read();
      return preventDefault;
    }
    else {
      this.rawEditor.model.read();
      return false;
    }
  }

  /**
   * tries to find and identify common keyboard shortcuts which emit other events we can tap in to
   * currently tries to catch copy, paste, cut and undo. definitly needs testing on mac
   * @method keydownMapsToOtherEvent
   */
  keydownMapsToOtherEvent(event) {
    return (event.ctrlKey || event.metaKey) && ["v","c","x"].includes(event.key);
  }
}
