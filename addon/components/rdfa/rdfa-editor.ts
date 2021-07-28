import { debug, warn } from '@ember/debug';
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import Component from '@glimmer/component';
import { tracked } from "@glimmer/tracking";
import { analyse as analyseRdfa } from '@lblod/marawa/rdfa-context-scanner';
import EventProcessor from '../../utils/rdfa/event-processor';
import HintsRegistry from '../../utils/rdfa/hints-registry';
import RdfaDocument from '../../utils/rdfa/rdfa-document';
import type IntlService from 'ember-intl/services/intl';
import RdfaEditorDispatcher from 'dummy/services/rdfa-editor-dispatcher';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import PernetRawEditor from '@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor';

interface DebugInfo {
  hintsRegistry: HintsRegistry
  editor: RawEditor
}

interface RdfaEditorArgs {
  /**
   * Function accepting a debug object containing the components used for debugging
   *   (e.g. hints registry, context scanner, editor)
   * @property initDebug
   * @type function
   *
   * @public
   */
  initDebug(debugInfo: DebugInfo): void
  /**
   * Plugin profile of the RDFa editor
   * @default 'default'
   * @public
   */
  profile?: string
  /**
   * callback that is called with an interface to the editor after editor init completed
   * @default 'default'
   * @public
   */
  rdfaEditorInit(editor: RdfaDocument): void
}

interface SuggestedHint {
  component: string
  info: Record<string, unknown>
}

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
export default class RdfaEditor extends Component<RdfaEditorArgs> {
  @service declare intl: IntlService;
  @tracked profile = 'default';

  /**
   * @property rdfaEditorDispatcher
   * @type RdfaEditorDispatcher
   *
   * @private
   */
  @service declare rdfaEditorDispatcher: RdfaEditorDispatcher;

  /**
   * @property eventProcessor
   * @type EventProcessor
   *
   * @private
   */
  @tracked eventProcessor?: EventProcessor;

  /**
   * @property hintsRegistry
   * @type HintsRegistry
   *
   * @private
   */
  @tracked hintsRegistry?: HintsRegistry;

  @tracked suggestedHints : SuggestedHint[] = [];

  /**
   * @property hasHints
   * @type boolean
   *
   * @private
   */
  get hasHints(): boolean {
    return this.hintsRegistry?.registry
      ? this.hintsRegistry.registry.length > 0
      : false;
  }

  /**
   * @property hasActiveHints
   * @type boolean
   *
   * @private
   */
  get hasActiveHints(): boolean {
    return this.hintsRegistry?.activeHints
      ? this.hintsRegistry?.activeHints?.length > 0
      : false;
  }

  /**
   * @property hasSuggestedHints
   */
  get hasSuggestedHints(): boolean {
    return this.suggestedHints.length > 0;
  }

  /**
   * editor controller
   */
  @tracked editor?: PernetRawEditor;

  constructor(owner: unknown, args: RdfaEditorArgs) {
    super(owner, args);
    const userLocale = (navigator.language || navigator.languages[0]);
    this.intl.setLocale([userLocale, 'nl-BE']);
    if (this.args.profile) {
      this.profile = this.args.profile;
    }
  }

  @action
  updateProfile() {
    if (this.eventProcessor && this.profile !== this.eventProcessor.profile) {
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
  handleRawEditorInit(editor: PernetRawEditor) {
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
    this.hintsRegistry.addRegistryObserver( (_registry: HintsRegistry) => {
      this.eventProcessor?.handleRegistryChange();
    });

    this.hintsRegistry.addNewCardObserver( (location: [number,number]) => {
      this.eventProcessor?.handleNewCardInRegistry(location);
    });

    this.hintsRegistry.addRemovedCardObserver( (location: [number, number]) => {
      this.eventProcessor?.handleRemovedCardInRegistry(location);
    });

    if (this.args.initDebug) {
      const debugInfo = {
        hintsRegistry: this.hintsRegistry,
        editor: this.eventProcessor.editor,
      };
      this.args.initDebug(debugInfo);
    }
    const rdfaDocument = new RdfaDocument(editor);
    if (this.args.rdfaEditorInit) {
      this.args.rdfaEditorInit(rdfaDocument);
    }
  }

  /**
   * requests hints from plugins
   *
   * @method triggerHints
   */
  @action
  async triggerHints() {
    if (!this.editor) {
      return;
    }

    const rootNode = this.editor.rootNode;
    const currentNode = this.editor.currentNode;

    let region;
    if (currentNode) {
      const currentRichNode = this.editor.getRichNodeFor(currentNode);
      region = currentRichNode?.region;
    } else {
      region = this.editor.currentSelection;
    }
    if (region) {
      const contexts = analyseRdfa(rootNode, region);
      if (contexts && contexts.length) {
        const context = contexts[0];
        const hints = await this.rdfaEditorDispatcher.requestHints(this.profile, context, this.editor);
        this.suggestedHints = hints;
      } else {
        debug('No RDFa blocks found in currentNode. Cannot hint suggestions.');
      }
    }
  }

  // Toggle RDFA blocks
  @tracked showRdfaBlocks = false;

  @action
  toggleRdfaBlocks() {
    this.showRdfaBlocks = !this.showRdfaBlocks;
    if (this.editor?.model) {
      this.editor.model.writeSelection();
    }
  }
}
