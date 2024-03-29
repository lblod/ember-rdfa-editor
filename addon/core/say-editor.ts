import { EditorState, Plugin } from 'prosemirror-state';
import type { NodeViewConstructor } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import {
  getPathFromRoot,
  isElement,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';

import { v4 as uuidv4 } from 'uuid';
import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import {
  baseKeymap,
  type KeymapOptions,
} from '@lblod/ember-rdfa-editor/core/keymap';
import { dropCursor } from 'prosemirror-dropcursor';
import { createLogger, type Logger } from '../utils/_private/logging-utils';
import { ReferenceManager } from '@lblod/ember-rdfa-editor/utils/_private/reference-manager';
import {
  datastore,
  isElementPNode,
  type ResolvedPNode,
} from '@lblod/ember-rdfa-editor/plugins/datastore';
import { tracked } from 'tracked-built-ins';
import recreateUuidsOnPaste from '../plugins/recreateUuidsOnPaste';
import type Owner from '@ember/owner';
import {
  type DefaultAttrGenPuginOptions,
  defaultAttributeValueGeneration,
} from '@lblod/ember-rdfa-editor/plugins/default-attribute-value-generation';
import SayView from '@lblod/ember-rdfa-editor/core/say-view';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import SaySerializer from '@lblod/ember-rdfa-editor/core/say-serializer';
import { rdfaInfoPlugin } from '../plugins/rdfa-info';
import { gapCursor } from '../plugins/gap-cursor';
import { removePropertiesOfDeletedNodes } from '@lblod/ember-rdfa-editor/plugins/remove-properties-of-deleted-nodes';
import { ProseParser } from '..';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/_private/html-input-parser';

export type PluginConfig = Plugin[] | { plugins: Plugin[]; override?: boolean };

interface SayEditorArgs {
  owner: Owner;
  target: Element;
  schema: Schema;
  baseIRI: string;
  plugins?: PluginConfig;
  nodeViews?: (
    controller: SayController,
  ) => Record<string, NodeViewConstructor>;
  defaultAttrGenerators?: DefaultAttrGenPuginOptions;
}

export default class SayEditor {
  @tracked mainView: SayView;
  @tracked activeView: SayView;
  @tracked showRdfaBlocks = false;
  owner: Owner;
  root: Element;
  baseIRI: string;
  pathFromRoot: Node[];
  schema: Schema;
  serializer: SaySerializer;

  private logger: Logger;
  parser: ProseParser;

  constructor(options: SayEditorArgs);
  /**
   *
   * @deprecated providing the `options` option when instantiating a `SayEditor` object is deprecated.
   * The behaviour of `selectBlockRdfaNode` is included by default.
   */
  constructor(options: SayEditorArgs & { keyMapOptions?: KeymapOptions });
  constructor({
    owner,
    target,
    schema,
    baseIRI,
    plugins = [],
    nodeViews = () => {
      return {};
    },
    defaultAttrGenerators = [],
    keyMapOptions,
  }: SayEditorArgs & { keyMapOptions?: KeymapOptions }) {
    this.logger = createLogger(this.constructor.name);
    this.owner = owner;
    this.root = target;
    this.pathFromRoot = getPathFromRoot(this.root, false);
    this.baseIRI = baseIRI;
    this.schema = schema;
    const pluginArr = plugins instanceof Array ? plugins : plugins.plugins;
    let pluginConf;
    if ('override' in plugins && plugins.override) {
      pluginConf = pluginArr;
    } else {
      pluginConf = [
        datastore({ pathFromRoot: this.pathFromRoot, baseIRI }),
        ...pluginArr,
        dropCursor(),
        gapCursor(),
        keymap(baseKeymap(schema, keyMapOptions)),
        history(),
        recreateUuidsOnPaste,
        defaultAttributeValueGeneration([
          {
            attribute: '__guid',
            generator() {
              return uuidv4();
            },
          },
          {
            attribute: '__rdfaId',
            generator() {
              return uuidv4();
            },
          },
          ...defaultAttrGenerators,
        ]),
        removePropertiesOfDeletedNodes(),
        rdfaInfoPlugin(),
      ];
    }

    this.parser = ProseParser.fromSchema(this.schema);
    const state = EditorState.create({
      doc: this.parser.parse(target),
      plugins: pluginConf,
    });
    this.serializer = SaySerializer.fromSchema(this.schema, this);
    this.mainView = new SayView(target, {
      state,
      attributes: { class: 'say-editor__inner say-content' },
      nodeViews: nodeViews(new SayController(this)),
      dispatchTransaction: (tr) => {
        const newState = this.mainView.state.apply(tr);
        this.mainView.updateState(newState);
      },
      handleDOMEvents: {
        focus: () => {
          this.setActiveView(this.mainView);
        },
      },
      domParser: this.parser,
      transformPastedHTML: (html, editorView) => {
        const htmlCleaner = new HTMLInputParser({ editorView });

        return htmlCleaner.prepareHTML(html);
      },
      clipboardSerializer: this.serializer,
    });
    this.activeView = this.mainView;
  }

  setActiveView(view: SayView) {
    this.activeView = view;
  }

  get htmlContent(): string {
    return this.mainView.htmlContent;
  }
}

export class ProseReferenceManager extends ReferenceManager<
  ResolvedPNode,
  ResolvedPNode
> {
  constructor() {
    super(
      (node: ResolvedPNode) => node,
      (bundle: ResolvedPNode) => {
        if (isElementPNode(bundle)) {
          const { from, to, node } = bundle;
          const name = node?.type.name || '';
          const attrs = JSON.stringify(node?.attrs);
          return `${from} - ${to} - ${name} - ${attrs}`;
        } else {
          const { from, to, domNode } = bundle;
          let domNodeTag = '';
          let domNodeAttrs = '';
          if (domNode) {
            domNodeTag = tagName(domNode);
            domNodeAttrs = isElement(domNode)
              ? JSON.stringify(domNode.attributes)
              : '';
          }
          return `${from} - ${to} - ${domNodeTag} - ${domNodeAttrs}`;
        }
      },
    );
  }
}
