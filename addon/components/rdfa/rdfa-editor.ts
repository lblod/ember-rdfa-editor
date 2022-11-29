import ApplicationInstance from '@ember/application/instance';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import Controller, {
  InternalWidgetSpec,
} from '@lblod/ember-rdfa-editor/core/controllers/controller';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';

import type IntlService from 'ember-intl/services/intl';
import { tracked } from 'tracked-built-ins';
import { Serializable } from '@lblod/ember-rdfa-editor/utils/render-spec';
import Prosemirror, {
  ProseController,
} from '@lblod/ember-rdfa-editor/core/prosemirror';
import { getOwner } from '@ember/application';
import RdfaEditorPlugin from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';
import { PlaceHolderPlugin } from '@lblod/ember-rdfa-editor/plugins/placeholder/placeholder';
import { rdfaSchema } from '@lblod/ember-rdfa-editor/core/schema';

export type PluginConfig =
  | string
  | {
      name: string;
      options: unknown;
    };

export interface ResolvedPluginConfig {
  instance: RdfaEditorPlugin;
  options: unknown;
}

interface RdfaEditorArgs {
  /**
   * callback that is called with an interface to the editor after editor init completed
   * @default 'default'
   * @public
   */
  rdfaEditorInit(editor: ProseController): void;

  plugins: PluginConfig[];
  stealFocus?: boolean;
  pasteBehaviour?: string;
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

  @tracked controller: ProseController | null = null;
  @tracked toolbarController: ProseController | null = null;
  @tracked inlineComponentController: Controller | null = null;

  @tracked editorLoading = true;
  private owner: ApplicationInstance;
  private logger: Logger;
  private prosemirror: Prosemirror | null = null;

  get plugins(): PluginConfig[] {
    return this.args.plugins || [];
  }

  get pasteBehaviour() {
    return this.args.pasteBehaviour ?? 'standard-html';
  }

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
   * @param {RawEditor} view, the editor interface
   *
   * @private
   */
  @action
  async handleRawEditorInit(target: Element) {
    // this.controller = new ViewController('rdfaEditorComponent', view);
    // this.updateWidgets();
    // this.toolbarController = new ViewController('toolbar', view);
    // this.inlineComponentController = new ViewController(
    //   'inline-component-manager',
    //   view
    // );
    // const rdfaDocument = new RdfaDocumentController('host', view);
    // window.__EDITOR = new RdfaDocumentController('debug', view);
    // this.updateConfig('pasteBehaviour', this.pasteBehaviour);
    // this.controller.addTransactionDispatchListener(this.onTransactionDispatch);
    window.__APPLICATION = getOwner(this)!;
    const initializedPlugins = await this.getPlugins();
    this.prosemirror = new Prosemirror(
      target,
      rdfaSchema,
      window.document.baseURI,
      initializedPlugins
    );
    window.__PM = this.prosemirror;
    window.__PC = new ProseController(this.prosemirror);
    this.toolbarController = new ProseController(this.prosemirror);
    this.controller = new ProseController(this.prosemirror);
    this.editorLoading = false;
    if (this.args.rdfaEditorInit) {
      this.args.rdfaEditorInit(new ProseController(this.prosemirror));
    }
  }

  async getPlugins(): Promise<RdfaEditorPlugin[]> {
    const pluginConfigs = this.plugins;
    const plugins: RdfaEditorPlugin[] = [new PlaceHolderPlugin()];
    for (const config of pluginConfigs) {
      let name;
      let options: unknown = null;
      if (typeof config === 'string') {
        name = config;
      } else {
        name = config.name;
        options = config.options;
      }

      const plugin = this.owner.lookup(
        `plugin:${name}`
      ) as RdfaEditorPlugin | null;
      if (plugin) {
        await plugin.initialize(options);
        plugins.push(plugin);
      } else {
        this.logger(`plugin ${name} not found! Skipping...`);
      }
    }
    return plugins;
  }

  // getPlugins(): ResolvedPluginConfig[] {
  //   const pluginConfigs = this.plugins;
  //   const plugins: ResolvedPluginConfig[] = [
  //     { instance: new BasicStyles(), options: null },
  //     { instance: new LumpNodePlugin(), options: null },
  //     { instance: new ShowActiveRdfaPlugin(), options: null },
  //     { instance: new AnchorPlugin(), options: null },
  //     { instance: new TablePlugin(), options: null },
  //     { instance: new ListPlugin(), options: null },
  //     { instance: new RdfaConfirmationPlugin(), options: null },
  //     { instance: new LiveMarkSetPlugin(), options: null },
  //   ];
  //   for (const config of pluginConfigs) {
  //     let name;
  //     let options: unknown = null;
  //     if (typeof config === 'string') {
  //       name = config;
  //     } else {
  //       name = config.name;
  //       options = config.options;
  //     }

  //     const plugin = this.owner.lookup(`plugin:${name}`) as EditorPlugin | null;
  //     if (plugin) {
  //       plugins.push({ instance: plugin, options });
  //     } else {
  //       this.logger(`plugin ${name} not found! Skipping...`);
  //     }
  //   }
  //   return plugins;
  // }

  // Toggle RDFA blocks
  @tracked showRdfaBlocks = false;

  @action
  toggleRdfaBlocks() {
    throw new NotImplementedError();
  }

  @action
  updateConfig(key: string, value: Serializable) {
    // if (this.controller) {
    //   this.controller.perform((tr) => {
    //     tr.setConfig(key, value.toString());
    //   });
    // }
  }

  get toolbarMiddleWidgets() {
    console.log(
      'TOOLBAR MIDDLE: ',
      this.controller?.widgets.get('toolbarMiddle')
    );
    return this.controller?.widgets.get('toolbarMiddle') || [];
  }

  get toolbarRightWidgets() {
    return this.controller?.widgets.get('toolbarRight') || [];
  }

  get sidebarWidgets() {
    return this.controller?.widgets.get('sidebar') || [];
  }

  get insertSidebarWidgets() {
    return this.controller?.widgets.get('insertSidebar') || [];
  }
}
