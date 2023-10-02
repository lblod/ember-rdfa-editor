import { EditorState, Plugin } from 'prosemirror-state';
import { NodeViewConstructor } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import {
  getPathFromRoot,
  isElement,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';

import { v4 as uuidv4 } from 'uuid';
import { gapCursor } from 'prosemirror-gapcursor';
import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import {
  baseKeymap,
  KeymapOptions,
} from '@lblod/ember-rdfa-editor/core/keymap';
import { dropCursor } from 'prosemirror-dropcursor';
import { createLogger, Logger } from '../utils/_private/logging-utils';
import { ReferenceManager } from '@lblod/ember-rdfa-editor/utils/_private/reference-manager';
import {
  datastore,
  isElementPNode,
  ResolvedPNode,
} from '@lblod/ember-rdfa-editor/plugins/datastore';
import { pasteHandler } from './paste-handler';
import { tracked } from 'tracked-built-ins';
import recreateUuidsOnPaste from '../plugins/recreateUuidsOnPaste';
import Owner from '@ember/owner';
import {
  DefaultAttrGenPuginOptions,
  defaultAttributeValueGeneration,
} from '@lblod/ember-rdfa-editor/plugins/default-attribute-value-generation';
import SayView from '@lblod/ember-rdfa-editor/core/say-view';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import SaySerializer from '@lblod/ember-rdfa-editor/core/say-serializer';
import SayParser from '@lblod/ember-rdfa-editor/core/say-parser';

export type PluginConfig = Plugin[] | { plugins: Plugin[]; override?: boolean };

interface SayEditorArgs {
  owner: Owner;
  target: Element;
  schema: Schema;
  baseIRI: string;
  plugins?: PluginConfig;

  keyMapOptions?: KeymapOptions;
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
  parser: SayParser;

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
  }: SayEditorArgs) {
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
        pasteHandler(),
        dropCursor(),
        gapCursor(),
        keymap(baseKeymap(schema, keyMapOptions)),
        history(),
        recreateUuidsOnPaste,
        defaultAttributeValueGeneration([
          {
            attribute: '__rdfaId',
            generator() {
              return uuidv4();
            },
          },
          ...defaultAttrGenerators,
        ]),
      ];
    }

    this.parser = SayParser.fromSchema(this.schema);
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
      clipboardSerializer: this.serializer,
    });
    this.activeView = this.mainView;
  }

  setActiveView(view: SayView) {
    this.activeView = view;
  }

  get htmlContent(): string {
    const div = document.createElement('div');
    const doc = this.serializer.serializeNode(
      this.mainView.state.doc,
      undefined,
    );
    div.appendChild(doc);
    return div.innerHTML;
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
