import classic from "ember-classic-decorator";
import { layout as templateLayout } from "@ember-decorators/component";
import { action } from "@ember/object";
import { union, alias } from "@ember/object/computed";
import Component from '@ember/component';
import layout from '../../templates/components/ce/content-editable';
import forgivingAction from '../../utils/ce/forgiving-action';
import RawEditor from '../../utils/ce/raw-editor';
import EnterHandler from '../../utils/ce/handlers/enter-handler';
import IgnoreModifiersHandler from '../../utils/ce/handlers/ignore-modifiers-handler';
import BackspaceHandler from '../../utils/ce/handlers/backspace-handler';
import TextInputHandler from '../../utils/ce/handlers/text-input-handler';
import HeaderMarkdownHandler from '../../utils/ce/handlers/header-markdown-handler';
import FallbackInputHandler from '../../utils/ce/handlers/fallback-input-handler';
import LumpNodeMovementObserver from '../../utils/ce/movement-observers/lump-node-movement-observer';
import LegacyMovementObserver from '../../utils/ce/movement-observers/legacy-movement-observer';
import BoldItalicUnderlineHandler from '../../utils/ce/handlers/bold-italic-underline-handler';
import UndoHandler from '../../utils/ce/handlers/undo-hander';
import ArrowHandler from '../../utils/ce/handlers/arrow-handler';
import TabHandler from '../../utils/ce/handlers/tab-handler';
import HTMLInputParser from '../../utils/html-input-parser';
import { normalizeEvent } from 'ember-jquery-legacy';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { next } from '@ember/runloop';

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
@classic
@templateLayout(layout)
export default class ContentEditable extends Component {
  tagName = ''
  @service() features;

  /**
   * latest cursor position in the contenteditable, it is aliased to the rawEditor.currentSelection
   *
   * @property currentSelection
   * @type Array
   *
   * @private
   */
  @alias('rawEditor.currentSelection')
  currentSelection;

  /**
   * latest text content in the contenteditable, it is aliased to the rawEditor.currentTextContent
   *
   *
   * @property currentTextContent
   * @type String
   *
   * @private
   */
  @alias('rawEditor.currentTextContent')
  currentTextContent;

  /**
   * element of the component, it is aliased to the rawEditor.rootNode
   *
   * @property element
   * @type DOMElement
   *
   * @private
   */
  rootNode = null;

  /**
   * richNode is the rich representation of the component element,
   * it is aliased to the rawEditor.richNode
   *
   * @property richNode
   * @type RichNode
   * @private
   */
  @alias('rawEditor.richNode')
  richNode;

  /**
   *
   * @property rawEditor
   * @type RawEditor
   */
  rawEditor = null;

  /**
   * components present in the editor
   * @property components
   * @type {Object}
   * @public
   */
  @alias('rawEditor.components')
  components;

  /**
   * ordered set of input handlers
   * @property eventHandlers
   * @type Array
   * @public
   */
  @union('externalHandlers', 'defaultHandlers')
  inputHandlers;

  /**
   * default input handlers
   * @property defaultHandlers
   * @type Array
   * @private
   */
  defaultHandlers = null;

  /**
   * external input handlersg
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
    const rawEditor = RawEditor.create({
      handleFullContentUpdate: this.get('handleFullContentUpdate'),
      textInsert: this.get('textInsert'),
      textRemove: this.get('textRemove'),
      elementUpdate: this.get('elementUpdate')
    });
    rawEditor.registerMovementObserver(new LegacyMovementObserver({notify: this.selectionUpdate}));
    rawEditor.registerMovementObserver(new LumpNodeMovementObserver());
    this.set('rawEditor', rawEditor);
    const forceParagraph = this.features.isEnabled('editor-force-paragraph');
    const defaultInputHandlers = [ ArrowHandler.create({rawEditor}),
                                   HeaderMarkdownHandler.create({rawEditor}),
                                   EnterHandler.create({rawEditor}),
                                   BackspaceHandler.create({rawEditor}),
                                   new TextInputHandler({rawEditor, forceParagraph }),
                                   TabHandler.create({rawEditor}),
                                   IgnoreModifiersHandler.create({rawEditor}),
                                   new UndoHandler({rawEditor}),
                                   new BoldItalicUnderlineHandler({rawEditor}),
                                   new FallbackInputHandler({rawEditor})
                                 ];

    this.set('currentTextContent', '');
    this.set('defaultHandlers', defaultInputHandlers);
    this.set('capturedEvents', A());
    if( ! this.externalHandlers ) {
      this.set('externalHandlers', []);
    }
  }

  didUpdateAttrs() {
    this.rawEditor.set('textInsert',this.textInsert);
    this.rawEditor.set('textRemove',this.textRemove);
    this.rawEditor.set('handleFullContentUpdate',this.handleFullContentUpdate);
    this.rawEditor.set('selectionUpdate',this.selectionUpdate);
    this.rawEditor.set('elementUpdate',this.elementUpdate);
    this.rawEditor.set('handleFullContentUpdate',this.handleFullContentUpdate);
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
   * specify whether yielded value should escape html syntax
   *
   * @property yieldHTML
   * @type boolean
   * @default true
   *
   * @public
   */
  yieldHTML = true;

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
   * keyup (we should ignore this, because it fires even if keydown does a preventDefault. however it is one of the few places we can capture page up, page down, arrow up and down so we capture those here using the fallback input handler)
   * input (captured, input has happened and all you can down is clean up)
   *
   * Chain 2 ( in FF input fires after compositionend): compositions (mostly on mac)
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
    if (! this.keydownMapsToOtherEvent(event)) {
      const preventDefault = this.passEventToHandlers( event );
      if (preventDefault) {
        event.preventDefault();
      }
    }
  }

  /**
   * keyDown events are handled for simple input we take over from
   * browser input.
   */

  @action
  handleKeyUp(event) {
    const preventDefault = this.passEventToHandlers( event );
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
    const preventDefault = this.passEventToHandlers( event );
    if (preventDefault)
      event.preventDefault();
  }

  /**
   * compositionEnd events are parsed for complex input, for uncaptured events we update
   * the internal state to be inline with reality
   */
  @action
  compositionEnd(event) {
    const preventDefault = this.passEventToHandlers( event );
    if (preventDefault)
      event.preventDefault();
  }

  /**
   * paste events are parsed and handled as good as possible
   */
  @action
  paste(event) {
    // see https://www.w3.org/TR/clipboard-apis/#paste-action for more info
    if (this.features.isEnabled('editor-html-paste')) {
      try {
        const inputParser = new HTMLInputParser({});
        const htmlPaste = (event.clipboardData || window.clipboardData).getData('text/html');
        const cleanHTML = inputParser.cleanupHTML(htmlPaste);
        const sel = this.rawEditor.selectHighlight(this.rawEditor.currentSelection);
        this.rawEditor.update(sel, {set: { innerHTML: cleanHTML}});
      }
      catch(e) {
        // fall back to text pasting
        console.warn(e); //eslint-ignore-line no-console
        const text = (event.clipboardData || window.clipboardData).getData('text');
        const sel = this.rawEditor.selectHighlight(this.rawEditor.currentSelection);
        this.rawEditor.update(sel, {set: { innerHTML: text}});
      }
    }
    else {
      const text = (event.clipboardData || window.clipboardData).getData('text');
      const sel = this.rawEditor.selectHighlight(this.rawEditor.currentSelection);
      this.rawEditor.update(sel, {set: { innerHTML: text}});
    }
    event.preventDefault();
    return false;
  }

  /**
   * cut isn't allowed at the moment
   */
  @action
  cut(event) {
    event.preventDefault();
  }

  /**
   * copy is relegated to the browser for now
   */
  @action
  copy( /* event */) {
    //not handling just yet
  }

  @action
  handleMouseUp(event) {
    const preventDefault = this.passEventToHandlers( event );
    if (preventDefault)
      event.preventDefault();
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
    event = normalizeEvent(event);
    const handlers = this.inputHandlers.filter( h => h.isHandlerFor(event));
    if (handlers.length > 0) {
      let preventDefault = false;
      for (let handler of handlers) {
        const handlerResponse = handler.handleEvent(event);
        if (! handlerResponse.allowBrowserDefault) {
          // if one handler decided the event default (e.g. browser bubbling) should be prevented we do so.
          preventDefault = true;
        }
        if (! handlerResponse.allowPropagation) {
          // handler does not allow this event to be passed to other handlers return immediately
          break;
        }
      }
      this.rawEditor.generateDiffEvents.perform();
      return preventDefault;
    }
    else {
      return false;
    }
  }

  /**
   * tries to find and identify common keyboard shortcuts which emit other events we can tap in to
   * currently tries to catch copy, paste, cut and undo. definitly needs testing on mac
   * @method keydownMapsToOtherEvent
   */
  keydownMapsToOtherEvent(event) {
    return (event.ctrlKey || event.metaKey ) && ["v","c","x"].includes(event.key);
  }
}
