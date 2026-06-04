/** eslint-disable @typescript-eslint/no-explicit-any */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';
import applyDevTools from 'prosemirror-dev-tools';

import { SayController } from '@lblod/ember-rdfa-editor';

import { getActiveEditableNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import EditorContainer from '@lblod/ember-rdfa-editor/components/editor-container';
import Editor from '@lblod/ember-rdfa-editor/components/editor';
import TableTooltip from '@lblod/ember-rdfa-editor/components/plugins/table/table-tooltip';
// import { DEFAULT_CONTEXT } from '../utils/constants';
import type IntlService from 'ember-intl/services/intl';
import Toolbar from './embed-tool.gts';
import { hash } from '@ember/helper';
// import type { EditorElement } from '../editor-element';
// FIXME
import {
  setupPlugins,
  type EditorSetup,
} from '../embed/setup-plugins.ts';
// import type { KebabPluginName } from '../plugins/embedded-plugin.ts';
import type { ModifierLike } from '@glint/template';
// import type { PluginOptions } from '../plugins/plugin-registry';
import Sidebar from './embed-sidebar.gts';

//////////
export const DEFAULT_CONTEXT = {
  vocab: 'http://data.vlaanderen.be/ns/besluit#',
  prefix: {
    eli: 'http://data.europa.eu/eli/ontology#',
    prov: 'http://www.w3.org/ns/prov#',
    mandaat: 'http://data.vlaanderen.be/ns/mandaat#',
    besluit: 'http://data.vlaanderen.be/ns/besluit#',
    ext: 'http://mu.semte.ch/vocabularies/ext/',
    person: 'http://www.w3.org/ns/person#',
    foaf: 'http://xmlns.com/foaf/0.1/',
    dateplugin: 'http://say.data.gift/manipulators/insertion/',
    besluittype: 'https://data.vlaanderen.be/id/concept/BesluitType/',
    dct: 'http://purl.org/dc/terms/',
    mobiliteit: 'https://data.vlaanderen.be/ns/mobiliteit#',
    lblodmow: 'http://data.lblod.info/vocabularies/mobiliteit/',
  },
};
// import type SayController from '@lblod/ember-rdfa-editor/core/say-controller';
// import type {
//   KebabPluginName,
//   UserPluginOptions,
// } from './plugins/embedded-plugin.ts';

/**
 * An HTML element with the class `notule-editor`.
 * These are functions available from the editor element.
 * :warning: **`initEditor` has to be called before accessing any other methods**.
 */
export type EditorElement = HTMLElement & {
  /**
   * provides direct access to a [SayController](https://github.com/lblod/ember-rdfa-editor/blob/master/addon/core/say-controller.ts) object.
   */
  controller: SayController;
  /**
   * Initialize the editor by passing an array of plugin names that should be activated and an object that contains the configuration for the editor and its plugins.
   * See {@link file://./README.md#managing-plugins} for more info.
   */
  initEditor: (
    // arrayOfPluginNames: readonly KebabPluginName[],
    // options: UserPluginOptions,
    arrayOfPluginNames: readonly any[],
    options: any,
  ) => Promise<void>;
  /**
   * enable the banner that shows the environment and versions of plugins used.
   */
  enableEnvironmentBanner: () => void;
  /**
   * disable the banner.
   */
  disableEnvironmentBanner: () => void;
  /**
   * set the HTML content inside the editor, overwriting all previous content.
   */
  setHtmlContent: (content: string) => void;
  /**
   * Get the HTML content of the editor.
   * This might be different than custom content set via `setHtmlContent`, because of HTML parsing logic.
   */
  getHtmlContent: () => string;
  /**
   * set the current locale of the editor.
   * Any locale is accepted, but will fallback to `nl-BE` if it is not `nl-BE` or `en-US` (the supported languages).
   */
  setLocale: (locale: string) => void;
  /**
   * returns the current locale of the editor.
   * This will be the user's browser locale, the set local with `setLocale`, or `nl-BE`/`en-US`, the supported languages.
   */
  getLocale: () => string;
  /**
   * Set the locale (language used) of the editor to Dutch.
   */
  setLocaleToDutch: () => void;
  /**
   * Set the locale (language used) of the editor to English.
   */
  setLocaleToEnglish: () => void;
};
//////////

interface Sig {
  Blocks: { default: [] };
}
export default class SimpleEditorComponent extends Component<Sig> {
  @tracked controller?: SayController;

  @tracked environment = '';

  @tracked showEnvironmentBanner = false;

  @tracked setup?: any;

  resolveEditorPromise?: () => void;

  declare editorElement: EditorElement;

  @service
  declare intl: IntlService;

  get vocabString() {
    return DEFAULT_CONTEXT.vocab;
  }

  get prefixString() {
    const ctx = DEFAULT_CONTEXT;
    return (
      Object.keys(ctx.prefix) as Array<keyof (typeof DEFAULT_CONTEXT)['prefix']>
    )
      .map((key) => `${key}: ${ctx.prefix[key]}`)
      .join(' ');
  }

  @action
  handleRdfaEditorInit(controller: SayController) {
    console.warn('editor innit')
    // This, together with `insertedInDom` adds the public-facing logic available to the consumer.
    // This includes the controller with most of the functionality
    // and some other helper functions for easy accessing.
    this.controller = controller;
    this.editorElement.getHtmlContent = this.getHtmlContent;
    this.editorElement.setHtmlContent = this.setHtmlContent;
    this.editorElement.controller = this.controller;
    applyDevTools(controller.mainEditorView);
    this.resolveEditorPromise?.();
  }

  insertedInDom: ModifierLike<{ Element: HTMLElement }> = modifier(
    (element: HTMLElement) => {
      console.log('inserted in DOM')
      this.setVocab(element);
      this.setPrefix(element);
      this.editorElement = element as EditorElement;
      // `insertedInDom` will run before `handleRdfaEditorInit`, which gives access to the controller
      // these methods can be used before the controller has been loaded
      this.editorElement.initEditor = this.initEditor;
      this.editorElement.enableEnvironmentBanner = this.enableEnvironmentBanner;
      this.editorElement.disableEnvironmentBanner =
        this.disableEnvironmentBanner;
      this.editorElement.setLocaleToDutch = this.setLocaleToDutch;
      this.editorElement.setLocaleToEnglish = this.setLocaleToEnglish;
      this.editorElement.getLocale = this.getLocale;
      this.editorElement.setLocale = this.setLocale;

      console.log('hack starting')
      const plugins = ['html-edit'];
      const options = {
        table: {
          rowBackground: {
            odd: 'whitesmoke',
          },
        },
        image: {
          allowBase64Images: true,
          pasteLimit: 2000000,
        },
      };
      return this.initEditor(plugins, options);
    // const setup = setupPlugins({ plugins, options, intl: this.intl });
    },
  );

  /**
   * this is a workaround because emberjs does not allow us to assign the prefix attribute in the template
   * see https://github.com/emberjs/ember.js/issues/19369
   */
  @action
  setPrefix(element: HTMLElement) {
    element.setAttribute('prefix', this.prefixString);
  }

  @action
  setVocab(element: HTMLElement) {
    element.setAttribute('vocab', this.vocabString);
  }

  getHtmlContent = () => {
    return this.controller?.htmlContent ?? '';
  };

  setHtmlContent = (content: string) => {
    if (!this.controller) {
      throw new Error('Controller used before editor was initialized');
    }
    this.controller.setHtmlContent(content);
  };

  setLocaleToDutch = () => {
    this.intl.setLocale(['nl-BE']);
  };

  setLocaleToEnglish = () => {
    this.intl.setLocale(['en-US', 'nl-BE']);
  };

  getLocale = () => {
    return this.intl.primaryLocale ?? '';
  };

  setLocale = (locale: string) => {
    return this.intl.setLocale([locale, 'nl-BE']);
  };

  @action
  setEnvironment(environment: string) {
    this.environment = environment;
  }

  enableEnvironmentBanner = (environment: string = 'Test') => {
    this.environment = environment;
    this.showEnvironmentBanner = true;
  };

  disableEnvironmentBanner = () => {
    this.showEnvironmentBanner = false;
  };

  initEditor = async (
    plugins: readonly any[],
    options: any,
  ): Promise<void> => {
    console.warn('init innit?')
    const setup = setupPlugins({ plugins, options, intl: this.intl });

    const editorPromise = new Promise<void>((resolve): void => {
      this.resolveEditorPromise = resolve;
    });
    this.setup = setup;
    return editorPromise;
  };

  get activeNode() {
    if (this.controller) {
      return getActiveEditableNode(this.controller.activeEditorState);
    }

    return null;
  }
  <template>
    <div id="ember-appuniversum-wormhole"></div>
    <div {{this.insertedInDom}} class="notule-editor">
      <div id="ember-basic-dropdown-wormhole"></div>
      {{#if this.setup}}
        {{#let this.setup as |s|}}
          <EditorContainer
            @editorOptions={{hash showPaper=true showToolbarBottom=false}}
          >
            <:top>
              {{#if this.controller}}
                <Toolbar
                  @activeNode={{this.activeNode}}
                  @toolbar={{s.toolbarConfig}}
                  @controller={{this.controller}}
                  @setup={{s}}
                />
              {{/if}}
            </:top>
            <:default>
              <Editor
                @plugins={{s.prosePlugins}}
                @schema={{s.schema}}
                @nodeViews={{s.nodeViews}}
                @rdfaEditorInit={{this.handleRdfaEditorInit}}
              />
              {{#if this.controller}}
                <TableTooltip @controller={{this.controller}} />
              {{/if}}
            </:default>
            <:aside>
              {{#if this.controller}}
                <Sidebar
                  @activeNode={{this.activeNode}}
                  @sidebar={{s.sidebarConfig}}
                  @controller={{this.controller}}
                  @setup={{s}}
                />
              {{/if}}
            </:aside>
          </EditorContainer>
        {{/let}}
      {{/if}}
    </div>
    {{yield}}
  </template>
}
