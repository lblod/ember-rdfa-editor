import classic from "ember-classic-decorator";
import { action } from "@ember/object";
import { layout as templateLayout } from "@ember-decorators/component";
import { inject } from "@ember/service";
import { A } from '@ember/array';
import Component from '@ember/component';
import { tracked } from "@glimmer/tracking";
import { debug, warn } from '@ember/debug';
import layout from '../../templates/components/rdfa/rdfa-editor';
import HintsRegistry from '../../utils/rdfa/hints-registry';
import EventProcessor from '../../utils/rdfa/event-processor';
import forgivingAction from '../../utils/rdfa/forgiving-action';
import { analyse as analyseRdfa } from '@lblod/marawa/rdfa-context-scanner';
import { inject as service } from '@ember/service';
import RdfaDocument from '../../utils/rdfa/rdfa-document';
/**
 * RDFa editor
 *
 * This module contains all classes and components provided by the @lblod/ember-rdfa-editor addon.
 * The main entrypoint is the {{#crossLink "RdfaEditorComponent"}}{{/crossLink}}.
 * @module rdfa-editor
 * @main rdfa-editor
 */

/**
* RDFa editor component
*
* This component wraps around a {{#crossLink "ContentEditableComponent"}}{{/crossLink}}
* and provides an architecture to interact with the document through plugins.
* {{#crossLinkModule "rdfa-editor"}}rdfa-editor{{/crossLinkModule}}.
* @module rdfa-editor
* @class RdfaEditorComponent
* @extends Component
*/
@classic
@templateLayout(layout)
export default class RdfaEditor extends Component {

  @service intl;
  /**
   * Plugin profile of the RDFa editor
   *
   * @property profile
   * @type string
   * @default 'default'
   *
   * @public
   */
  @tracked profile = 'default';

  /**
   * Function accepting a debug object containing the components used for debugging
   *   (e.g. hints registry, context scanner, editor)
   * @property initDebug
   * @type function
   *
   * @public
   */
  initDebug = null;

  /**
   * @property rdfaEditorDispatcher
   * @type RdfaEditorDispatcher
   *
   * @private
   */
  @inject()
  rdfaEditorDispatcher;

  /**
   * @property eventProcessor
   * @type EventProcessor
   *
   * @private
   */
  @tracked eventProcessor = null;

  /**
   * @property hinstRegistry
   * @type HintsRegistry
   *
   * @private
   */
  @tracked hintsRegistry = null;

  /**
   * @property hasHints
   * @type boolean
   *
   * @private
   */
  get hasHints() {
   return this.hintsRegistry?.registry.length > 0;
  }

  /**
   * @property hasActiveHints
   * @type boolean
   *
   * @private
   */
  get hasActiveHints() {
    return this.hintsRegistry?.activeHints?.length > 0;
  }

  /**
   * @property hasSuggestedHints
   */
  get hasSuggestedHints() {
    return this.suggestedHints.length > 0;
  }

  /**
   * @property rootModelNode
   */
  get rootModelNode() {
    return this.editor.rootModelNode;
  }
  /**
   * Contains extra handlers for input events on the editor.
   *
   * @property handlers
   * @type Ember.A
   *
   * @private
   */
  handlers = null;

  /**
   * editor controller
   *
   */
  @tracked editor;

  init() {
    super.init(...arguments);
    const userLocale = ( navigator.language || navigator.languages[0] );
    this.intl.setLocale([userLocale, 'nl-BE']);
    this.set('handlers', A());
  }

  didUpdateAttrs() {
    if (this.profile != this.eventProcessor.profile) {
      this.eventProcessor.profile = this.profile;
    }
  }

  /**
   * This function is called when an action is fired on the editor,
   * before the editor itself has been set up.  When this happens, we
   * can't dispatch the action to the correct component.
   *
   * @method warnNotSetup
   * @private
   */
  warnNotSetup() {
    warn("An action was fired before the editor was set up", { id: "rdfa-editor.not-setup" } );
  }

  /**
   * This is called in cases where an optional action is triggered
   * from the frontend.  This noop can be called as a fallback in case no operation
   * needs to occur if the action is not defined.
   * @method noop
   */
  noop() { return; }

  /**
   * Handle init of rawEditor
   *
   * @method handleRawEditorInit
   *
   * @param {RawEditor} editor, the editor interface
   *
   * @private
   */
  @action
  handleRawEditorInit(editor) {

    this.editor = editor;
    this.hintsRegistry = new HintsRegistry(editor);
    this.eventProcessor = new EventProcessor({
      registry: this.hintsRegistry,
      profile: this.profile,
      dispatcher: this.rdfaEditorDispatcher,
      editor: this.editor
    });
    editor.registerContentObserver(this.eventProcessor);
    editor.registerMovementObserver(this.eventProcessor);
    this.hintsRegistry.addRegistryObserver( (registry) => {
      this.eventProcessor.handleRegistryChange(registry);
    });

    this.hintsRegistry.addNewCardObserver( (card) => {
      this.eventProcessor.handleNewCardInRegistry(card);
    });

    this.hintsRegistry.addRemovedCardObserver( (card) => {
      this.eventProcessor.handleRemovedCardInRegistry(card);
    });

    if (this.initDebug) {
      const debugInfo = {
        hintsRegistry: this.hintsRegistry,
        editor: this.eventProcessor.editor,
        contextScanner: this.eventProcessor.scanner
      };
      this.initDebug(debugInfo);
    }
    const rdfaDocument = new RdfaDocument(editor);
    forgivingAction('rdfaEditorInit', this)(rdfaDocument);
  }

  /**
   * requests hints from plugins
   *
   * @method triggerHints
   */
  @action
  async triggerHints() {
    const rootNode = this.editor.rootNode;
    const currentNode = this.editor.currentNode;
    let region = [];
    if (currentNode) {
      const currentRichNode = this.editor.getRichNodeFor(currentNode);
      region = currentRichNode.region;
    } else {
      region = this.editor.currentSelection;
    }
    const contexts = analyseRdfa(rootNode, region);
    if (contexts && contexts.length) {
      const context = contexts[0];
      const hints = await this.rdfaEditorDispatcher.requestHints(this.profile, context, this.editor);
      this.set('suggestedHints', hints);
    } else {
      debug('No RDFa blocks found in currentNode. Cannot hint suggestions.');
    }

  }

  // Toggle RDFA blocks
  @tracked showRdfaBlocks = false;

  @action
  toggleRdfaBlocks() {
    this.showRdfaBlocks = !this.showRdfaBlocks;

    // Focus editor
    document.getElementsByClassName("say-editor__inner")[0].focus();
  }
}
