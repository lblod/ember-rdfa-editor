import {inject as service} from "@ember/service";
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import Editor, {WidgetSpec} from "@lblod/ember-rdfa-editor/core/editor";
import {action} from "@ember/object";
import EditorController, {EditorControllerImpl} from "@lblod/ember-rdfa-editor/core/editor-controller";
import ApplicationInstance from "@ember/application/instance";
import {tracked} from "@glimmer/tracking";
import { getOwner, setOwner } from "@ember/application";

// interface DebugInfo {
//   hintsRegistry: HintsRegistry
//   editor: Editor
// }
const ESSENTIAL_PLUGINS = ["typing", "content-control", "deletion", "navigation"];
const DEFAULT_PLUGINS = ["history", "text-styles", "lists", "searching", "tables", "clipboard"];

interface RdfaEditorArgs {
  /**
   * Function accepting a debug object containing the components used for debugging
   *   (e.g. hints registry, context scanner, editor)
   * @property initDebug
   * @type function
   *
   * @public
   */
  // initDebug(debugInfo: DebugInfo): void

  ownerName: string
  /**
   * EditorPlugin profile of the RDFa editor
   * @public
   */
  plugins: string[]


  /**
   * callback that is called with an interface to the editor after editor init completed
   * @default 'default'
   * @public
   */
  rdfaEditorInit(controller: EditorController): void
}

/**
 * RDFa editor component
 *
 * This component wraps around a {@link ContentEditable} component
 * and provides an architecture to interact with the document through plugins.
 *
 * @module rdfa-editor
 * @class RdfaEditorComponent
 * @extends Component
 */
export default class RdfaEditor extends Component<RdfaEditorArgs> {
  @service declare intl: IntlService;
  activePlugins: EditorPlugin[] = [];
  owner: ApplicationInstance;
  @tracked
  showRdfaBlocks = false;
  @tracked
  _editor?: Editor;
  @tracked
  _hostController?: EditorController;


  constructor(owner: ApplicationInstance, args: RdfaEditorArgs) {
    super(owner, args);
    this.owner = owner;
    const userLocale = (navigator.language || navigator.languages[0]);
    this.intl.setLocale([userLocale, 'nl-BE']);
  }


  get plugins() {
    return this.args.plugins || DEFAULT_PLUGINS;
  }

  get editor() {
    return this._editor;
  }

  get hostController() {
    return this._hostController;
  }

  get toolbarWidgets(): WidgetSpec[] {
    // warning: this is not tracked
    return this._editor?.widgetMap.get("toolbar") || [];
  }

  get sidebarWidgets(): WidgetSpec[] {
    // warning: this is not tracked
    return this._editor?.widgetMap.get("sidebar") || [];
  }

  @action
  async editorInit(editor: Editor) {
    // order is important here, initialize first before assigning
    await this.initialize(editor);
    const controller = new EditorControllerImpl("host-app", editor);
    window.__controller = new EditorControllerImpl("window-console", editor);
    this._hostController = controller;
    this.args.rdfaEditorInit(controller);
    this._editor = editor;

  }

  async initialize(editor: Editor) {
    const plugins = this.getPlugins();
    for (const plugin of plugins) {
      console.log("INITIALIZING", plugin.name);
      await this.initializePlugin(plugin, editor);
    }

  }

  getPlugins(): EditorPlugin[] {
    const pluginNames = [...ESSENTIAL_PLUGINS, ...this.plugins];
    const plugins = [];
    for (const name of pluginNames) {
      const plugin = this.owner.lookup(`plugin:${name}`) as EditorPlugin | null;
      if (plugin) {
        plugins.push(plugin);
      }
    }
    return plugins;

  }

  async initializePlugin(plugin: EditorPlugin, editor: Editor): Promise<void> {
    const controller = new EditorControllerImpl(plugin.name, editor);
    await plugin.initialize(controller);
    this.activePlugins.push(plugin);

  }


  // /**
  //  * @property rdfaEditorDispatcher
  //  * @type RdfaEditorDispatcher
  //  *
  //  * @private
  //  */
  // @service declare rdfaEditorDispatcher: RdfaEditorDispatcher;
  //
  // /**
  //  * @property eventProcessor
  //  * @type EventProcessor
  //  *
  //  * @private
  //  */
  // @tracked eventProcessor?: EventProcessor;
  //
  // /**
  //  * @property hintsRegistry
  //  * @type HintsRegistry
  //  *
  //  * @private
  //  */
  // @tracked hintsRegistry?: HintsRegistry;
  //
  // @tracked suggestedHints : SuggestedHint[] = [];
  //
  // /**
  //  * @property hasHints
  //  * @type boolean
  //  *
  //  * @private
  //  */
  // get hasHints(): boolean {
  //   return this.hintsRegistry?.registry
  //     ? this.hintsRegistry.registry.length > 0
  //     : false;
  // }
  //
  // /**
  //  * @property hasActiveHints
  //  * @type boolean
  //  *
  //  * @private
  //  */
  // get hasActiveHints(): boolean {
  //   return this.hintsRegistry?.activeHints
  //     ? this.hintsRegistry?.activeHints?.length > 0
  //     : false;
  // }
  //
  // /**
  //  * @property hasSuggestedHints
  //  */
  // get hasSuggestedHints(): boolean {
  //   return this.suggestedHints.length > 0;
  // }
  //
  // /**
  //  * editor controller
  //  */
  // @tracked editor?: PernetRawEditor;
  //
  //
  // @action
  // updateProfile() {
  //   if (this.eventProcessor && this.profile !== this.eventProcessor.profile) {
  //     this.eventProcessor.profile = this.profile;
  //   }
  // }
  //
  // /**
  //  * This function is called when an action is fired on the editor,
  //  * before the editor itself has been set up.  When this happens, we
  //  * can't dispatch the action to the correct component.
  //  *
  //  * @method warnNotSetup
  //  * @private
  //  */
  // warnNotSetup() {
  //   warn("An action was fired before the editor was set up", { id: "rdfa-editor.not-setup" } );
  // }
  //
  // /**
  //  * This is called in cases where an optional action is triggered
  //  * from the frontend.  This noop can be called as a fallback in case no operation
  //  * needs to occur if the action is not defined.
  //  * @method noop
  //  */
  // noop() { return; }
  //
  // /**
  //  * Handle init of rawEditor
  //  *
  //  * @method handleRawEditorInit
  //  *
  //  * @param {RawEditor} editor, the editor interface
  //  *
  //  * @private
  //  */
  // @action
  // handleRawEditorInit(editor: PernetRawEditor) {
  //   this.editor = editor;
  //   this.hintsRegistry = new HintsRegistry(editor);
  //   this.eventProcessor = new EventProcessor({
  //     registry: this.hintsRegistry,
  //     profile: this.profile,
  //     dispatcher: this.rdfaEditorDispatcher,
  //     editor: this.editor
  //   });
  //   this.rdfaEditorDispatcher.initializeServices(editor);
  //   editor.registerContentObserver(this.eventProcessor);
  //   editor.registerMovementObserver(this.eventProcessor);
  //   this.hintsRegistry.addRegistryObserver( (_registry: HintsRegistry) => {
  //     this.eventProcessor?.handleRegistryChange();
  //   });
  //
  //   this.hintsRegistry.addNewCardObserver( (location: [number,number]) => {
  //     this.eventProcessor?.handleNewCardInRegistry(location);
  //   });
  //
  //   this.hintsRegistry.addRemovedCardObserver( (location: [number, number]) => {
  //     this.eventProcessor?.handleRemovedCardInRegistry(location);
  //   });
  //
  //   if (this.args.initDebug) {
  //     const debugInfo = {
  //       hintsRegistry: this.hintsRegistry,
  //       editor: this.eventProcessor.editor,
  //     };
  //     this.args.initDebug(debugInfo);
  //   }
  //   const rdfaDocument = new RdfaDocument(editor);
  //   if (this.args.rdfaEditorInit) {
  //     this.args.rdfaEditorInit(rdfaDocument);
  //   }
  // }
  //
  // /**
  //  * requests hints from plugins
  //  *
  //  * @method triggerHints
  //  */
  // @action
  // async triggerHints() {
  //   if (!this.editor) {
  //     return;
  //   }
  //
  //   const rootElement = this.editor.rootElement;
  //   const currentNode = this.editor.currentNode;
  //
  //   let region;
  //   if (currentNode) {
  //     const currentRichNode = this.editor.getRichNodeFor(currentNode);
  //     region = currentRichNode?.region;
  //   } else {
  //     region = this.editor.currentSelection;
  //   }
  //   if (region) {
  //     const contexts = analyseRdfa(rootElement, region);
  //     if (contexts && contexts.length) {
  //       const context = contexts[0];
  //       const hints = await this.rdfaEditorDispatcher.requestHints(this.profile, context, this.editor);
  //       this.suggestedHints = hints;
  //     } else {
  //       debug('No RDFa blocks found in currentNode. Cannot hint suggestions.');
  //     }
  //   }
  // }
  //
  // // Toggle RDFA blocks
  // @tracked showRdfaBlocks = false;
  //
  @action
  toggleRdfaBlocks() {
    this.showRdfaBlocks = !this.showRdfaBlocks;
    // if (this.editor?.model) {
    //   this.editor.model.writeSelection();
    // }
  }
}
