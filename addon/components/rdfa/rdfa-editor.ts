import ApplicationInstance from '@ember/application/instance';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';

import type IntlService from 'ember-intl/services/intl';
import { tracked } from 'tracked-built-ins';
import Prosemirror, {
  ProseController,
  WidgetSpec,
} from '@lblod/ember-rdfa-editor/core/prosemirror';
import { getOwner } from '@ember/application';
import RdfaEditorPlugin from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';
import { NodeViewConstructor } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';
import { Owner } from 'window';

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

  initializers?: Array<() => Promise<void>>;
  schema: Schema;
  baseIRI?: string;
  plugins?: Plugin[];
  stealFocus?: boolean;
  pasteBehaviour?: string;
  widgets?: WidgetSpec[];
  nodeViews?: (controller: ProseController) => {
    [node: string]: NodeViewConstructor;
  };
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

  @tracked editorLoading = true;
  private owner: ApplicationInstance;
  private logger: Logger;
  private prosemirror: Prosemirror | null = null;

  constructor(owner: ApplicationInstance, args: RdfaEditorArgs) {
    super(owner, args);
    this.owner = owner;
    const userLocale = navigator.language || navigator.languages[0];
    this.intl.setLocale([userLocale, 'nl-BE']);
    this.logger = createLogger(this.constructor.name);
  }

  get pasteBehaviour() {
    return this.args.pasteBehaviour ?? 'standard-html';
  }

  get initializers() {
    return this.args.initializers || [];
  }

  get baseIRI() {
    return this.args.baseIRI || window.document.baseURI;
  }

  /**
   * Handle init of rawEditor
   *
   * @method handleRawEditorInit
   *
   * @param {Element} target the html element the editor will render into
   *
   * @private
   */
  @action
  async handleRawEditorInit(target: Element) {
    window.__APPLICATION = unwrap(getOwner(this)) as Owner;
    await Promise.all(this.initializers);
    this.prosemirror = new Prosemirror({
      target,
      schema: this.args.schema,
      baseIRI: this.baseIRI,
      plugins: this.args.plugins,
      nodeViews: this.args.nodeViews,
      widgets: this.args.widgets,
    });
    window.__PM = this.prosemirror;
    window.__PC = new ProseController(this.prosemirror);
    this.toolbarController = new ProseController(this.prosemirror);
    this.controller = new ProseController(this.prosemirror);
    this.editorLoading = false;
    if (this.args.rdfaEditorInit) {
      this.args.rdfaEditorInit(new ProseController(this.prosemirror));
    }
  }

  // Toggle RDFA blocks
  @tracked showRdfaBlocks = false;

  @action
  toggleRdfaBlocks() {
    this.showRdfaBlocks = !this.showRdfaBlocks;
  }

  @action
  updateConfig(_key: string, _value: unknown) {
    throw new NotImplementedError();
  }

  get toolbarMiddleWidgets() {
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
