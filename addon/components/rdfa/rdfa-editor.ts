import ApplicationInstance from '@ember/application/instance';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import Controller, {
  EditorController,
  InternalWidgetSpec,
} from '@lblod/ember-rdfa-editor/model/controller';
import { ActiveComponentEntry } from '@lblod/ember-rdfa-editor/model/inline-components/inline-components-registry';
import BasicStyles from '@lblod/ember-rdfa-editor/plugins/basic-styles/basic-styles';
import LumpNodePlugin from '@lblod/ember-rdfa-editor/plugins/lump-node/lump-node';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';
import RdfaDocument from '@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document';

import type IntlService from 'ember-intl/services/intl';
import { tracked } from 'tracked-built-ins';
import { default as RdfaDocumentController } from '../../utils/rdfa/rdfa-document';

interface RdfaEditorArgs {
  /**
   * callback that is called with an interface to the editor after editor init completed
   * @default 'default'
   * @public
   */
  rdfaEditorInit(editor: RdfaDocument): void;

  plugins: string[];
  stealFocus?: boolean;
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

  @tracked toolbarWidgets: InternalWidgetSpec[] = [];
  @tracked sidebarWidgets: InternalWidgetSpec[] = [];
  @tracked insertSidebarWidgets: InternalWidgetSpec[] = [];
  @tracked toolbarController: Controller | null = null;
  @tracked inlineComponents = tracked<ActiveComponentEntry>([]);

  @tracked editorLoading = true;
  private owner: ApplicationInstance;
  private logger: Logger;

  get plugins(): string[] {
    return this.args.plugins || [];
  }
  get editorPlugins(): EditorPlugin[] {
    return this.getPlugins();
  }

  /**
   * editor controller
   */
  @tracked editor?: Editor;

  constructor(owner: ApplicationInstance, args: RdfaEditorArgs) {
    super(owner, args);
    this.owner = owner;
    const userLocale = navigator.language || navigator.languages[0];
    this.intl.setLocale([userLocale, 'nl-BE']);
    this.logger = createLogger(this.constructor.name);
  }

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
  handleRawEditorInit(editor: Editor) {
    this.editor = editor;
    this.toolbarWidgets = editor.state.widgetMap.get('toolbar') || [];
    this.sidebarWidgets = editor.state.widgetMap.get('sidebar') || [];
    this.insertSidebarWidgets =
      editor.state.widgetMap.get('insertSidebar') || [];
    this.toolbarController = new EditorController('toolbar', editor);
    const rdfaDocument = new RdfaDocumentController('host-controller', editor);
    if (this.args.rdfaEditorInit) {
      this.args.rdfaEditorInit(rdfaDocument);
    }
    this.initializeComponents();
    this.editorLoading = false;
  }

  getPlugins(): EditorPlugin[] {
    const pluginNames = this.plugins;
    // const plugins = [new BasicStyles(), new LumpNodePlugin()];
    const plugins = [];
    for (const name of pluginNames) {
      const plugin = this.owner.lookup(`plugin:${name}`) as EditorPlugin | null;
      if (plugin) {
        plugins.push(plugin);
      } else {
        this.logger(`plugin ${name} not found! Skipping...`);
      }
    }
    return plugins;
  }

  // Toggle RDFA blocks
  @tracked showRdfaBlocks = false;

  @action
  toggleRdfaBlocks() {
    this.showRdfaBlocks = !this.showRdfaBlocks;
    // if (this.editor?.model) {
    //   this.editor.model.writeSelection();
    // }
  }

  initializeComponents() {
    if (this.editor) {
      this.inlineComponents =
        this.editor.state.inlineComponentsRegistry.componentInstances;
    }
  }
}
