import { action } from '@ember/object';
import Component from '@glimmer/component';
import {
  createLogger,
  type Logger,
} from '#root/utils/_private/logging-utils.ts';
import { tracked } from 'tracked-built-ins';
import SayEditor, { type PluginConfig } from '#root/core/say-editor.ts';
import type { NodeViewConstructor } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { getOwner } from '@ember/application';
import type Owner from '@ember/owner';
import type { DefaultAttrGenPuginOptions } from '#root/plugins/default-attribute-value-generation/index.ts';
import SayController from '#root/core/say-controller.ts';
import type { KeymapOptions } from '../core/keymap.ts';
import { deprecate } from '@ember/debug';
import { notificationPlugin } from '#root/plugins/notification/index.ts';
import { service } from '@ember/service';
import type {
  Notification,
  NotificationOptions,
} from '#root/plugins/notification/index.ts';
import type IntlService from 'ember-intl/services/intl';

export interface RdfaEditorArgs {
  /**
   * callback that is called with an interface to the editor after editor init completed
   * @default 'default'
   * @public
   */
  rdfaEditorInit(editor: SayController): void;

  initializers?: Array<Promise<void>>;
  schema: Schema;
  baseIRI?: string;
  plugins?: PluginConfig;
  stealFocus?: boolean;
  nodeViews?: (controller: SayController) => {
    [node: string]: NodeViewConstructor;
  };
  defaultAttrGenerators?: DefaultAttrGenPuginOptions;
  keyMapOptions?: KeymapOptions;
  editable?: boolean;
  notificationCallback?: (notification: Notification) => void;
  notificationToaster?: boolean;
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
  @tracked controller: SayController | null = null;
  @service declare toaster: {
    notify: (
      message: string | undefined,
      title: string | undefined,
      options: NotificationOptions,
    ) => void;
  };
  @service declare intl: IntlService;

  private logger: Logger = createLogger(this.constructor.name);
  private prosemirror: SayEditor | null = null;

  get initializers() {
    return this.args.initializers || [];
  }

  get baseIRI() {
    return this.args.baseIRI || window.document.baseURI;
  }

  get editable() {
    return this.args.editable;
  }

  // We show the notification toaster unless told otherwise in the editor arguments
  get notificationToaster() {
    return this.args.notificationToaster === false ? false : true;
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
    if (this.initializers.length) {
      await Promise.all(this.initializers);
      this.logger(`Awaited ${this.initializers.length} initializers.`);
    }

    if (this.args.keyMapOptions) {
      deprecate(
        '@keyMapOptions is deprecated. The behaviour of `selectBlockRdfaNode` is included by default.',
        false,
        {
          id: '@lblod/ember-rdfa-editor.editor.keyMapOptions-argument',
          until: '10.0.0',
          for: '@lblod/ember-rdfa-editor',
          since: {
            available: '9.6.0',
            enabled: '9.6.0',
          },
        },
      );
    }

    const notificationCallback =
      this.args.notificationCallback ??
      ((notification: Notification) =>
        this.toaster.notify(
          notification.message,
          notification.title,
          notification.options,
        ));
    let plugins: PluginConfig;
    const notificationPluginOptions = {
      notificationCallback: notificationCallback.bind(this),
      intl: this.intl,
    };
    if (Array.isArray(this.args.plugins)) {
      plugins = [
        ...this.args.plugins,
        notificationPlugin(notificationPluginOptions),
      ];
    } else if (this.args.plugins) {
      plugins = {
        plugins: [
          ...this.args.plugins.plugins,
          notificationPlugin(notificationPluginOptions),
        ],
        override: this.args.plugins.override,
      };
    } else {
      plugins = [notificationPlugin(notificationPluginOptions)];
    }

    this.prosemirror = new SayEditor({
      owner: getOwner(this) as Owner,
      target,
      schema: this.args.schema,
      baseIRI: this.baseIRI,
      plugins,
      nodeViews: this.args.nodeViews,
      defaultAttrGenerators: this.args.defaultAttrGenerators,
      keyMapOptions: this.args.keyMapOptions,
      editable: () => {
        return !(this.editable === false);
      },
    });
    window.__PM = this.prosemirror;
    window.__PC = new SayController(this.prosemirror);
    this.controller = new SayController(this.prosemirror);
    if (this.args.rdfaEditorInit) {
      this.args.rdfaEditorInit(new SayController(this.prosemirror));
    }
  }
}
