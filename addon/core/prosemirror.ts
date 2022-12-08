import { Command, EditorState, Plugin, Transaction } from 'prosemirror-state';
import { EditorView, NodeViewConstructor } from 'prosemirror-view';
import {
  Attrs,
  DOMParser as ProseParser,
  DOMSerializer,
  Mark,
  MarkType,
  Node as PNode,
  Schema,
} from 'prosemirror-model';
import { baseKeymap, selectAll, toggleMark } from 'prosemirror-commands';
import { getPathFromRoot } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { gapCursor } from 'prosemirror-gapcursor';
import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import { defaultKeymap } from '@lblod/ember-rdfa-editor/core/keymap';
import { tracked } from '@glimmer/tracking';
import { dropCursor } from 'prosemirror-dropcursor';
import MapUtils from '../utils/map-utils';
import { createLogger, Logger } from '../utils/logging-utils';
import { filter, objectValues } from 'iter-tools';
import {
  ProseStore,
  proseStoreFromParse,
  ResolvedPNode,
} from '@lblod/ember-rdfa-editor/utils/datastore/prose-store';
import { TemplateFactory } from 'ember-cli-htmlbars';

export type WidgetLocation =
  | 'toolbarMiddle'
  | 'toolbarRight'
  | 'sidebar'
  | 'insertSidebar';

export interface WidgetSpec {
  componentName: string;
  desiredLocation: WidgetLocation;
  widgetArgs?: unknown;
}

export type InternalWidgetSpec = WidgetSpec & {
  controller: ProseController;
};

interface ProsemirrorArgs {
  target: Element;
  schema: Schema;
  baseIRI: string;
  plugins?: Plugin[];
  widgets?: WidgetSpec[];
  nodeViews?: (
    controller: ProseController
  ) => Record<string, NodeViewConstructor>;
  devtools?: boolean;
}

export default class Prosemirror {
  view: EditorView;
  @tracked _state: EditorState;
  @tracked datastore: ProseStore;
  @tracked widgets: Map<WidgetLocation, InternalWidgetSpec[]> = new Map();
  root: Element;
  baseIRI: string;
  pathFromRoot: Node[];
  schema: Schema;
  private readonly tag: (node: ResolvedPNode) => string;
  private readonly children: (node: ResolvedPNode) => Iterable<ResolvedPNode>;
  private readonly attributes: (node: ResolvedPNode) => Attrs;
  private readonly isText: (node: ResolvedPNode) => boolean;

  private logger: Logger;

  constructor({
    target,
    schema,
    baseIRI,
    plugins = [],
    widgets = [],
    nodeViews = () => {
      return {};
    },
  }: ProsemirrorArgs) {
    this.logger = createLogger(this.constructor.name);
    this.root = target;
    this.baseIRI = baseIRI;
    this.schema = schema;
    this.view = new EditorView(target, {
      state: EditorState.create({
        doc: ProseParser.fromSchema(this.schema).parse(target),
        plugins: [
          ...plugins,

          dropCursor(),
          gapCursor(),

          keymap(defaultKeymap(schema)),
          keymap(baseKeymap),
          history(),
        ],
      }),
      attributes: { class: 'say-editor__inner say-content' },
      nodeViews: nodeViews(new ProseController(this)),
      dispatchTransaction: this.dispatch,
    });
    this._state = this.view.state;
    this.pathFromRoot = getPathFromRoot(this.root, false);
    this.tag = tag(this.schema);
    this.children = children(this.schema);
    this.attributes = attributes(this.schema);
    this.isText = isText(this.schema);
    this.datastore = proseStoreFromParse({
      root: { node: this._state.doc },
      textContent,
      tag: this.tag,
      children: this.children,
      attributes: this.attributes,
      isText: this.isText,
      getParent,

      pathFromDomRoot: this.pathFromRoot,
      baseIRI,
    });
    this.initializeEditorWidgets(widgets);
  }

  initializeEditorWidgets(widgets: WidgetSpec[]) {
    const widgetMap: Map<WidgetLocation, InternalWidgetSpec[]> = new Map();
    widgets.forEach((widgetSpec) => {
      MapUtils.setOrPush(widgetMap, widgetSpec.desiredLocation, {
        ...widgetSpec,
        controller: new ProseController(this),
      });
    });
    this.widgets = widgetMap;
  }

  get editable() {
    return this.view.editable;
  }

  get state() {
    return this._state;
  }

  focus() {
    this.view.focus();
  }

  dispatch = (tr: Transaction) => {
    const newState = this.state.apply(tr);

    if (tr.docChanged) {
      this.datastore = proseStoreFromParse({
        textContent,
        tag: this.tag,
        children: this.children,
        attributes: this.attributes,
        isText: this.isText,
        getParent,
        root: { node: newState.doc },
        pathFromDomRoot: this.pathFromRoot,
        baseIRI: this.baseIRI,
      });
      this.logger(`Parsed ${this.datastore.size} triples`);
    }

    this.view.updateState(newState);
    this._state = newState;
  };
}

export class ProseController {
  @tracked
  private pm: Prosemirror;

  constructor(pm: Prosemirror) {
    this.pm = pm;
  }

  clone() {
    return new ProseController(this.pm);
  }

  toggleMark(name: string) {
    this.focus();
    this.doCommand(toggleMark(this.schema.marks[name]));
  }

  focus() {
    this.pm.focus();
  }

  setHtmlContent(content: string) {
    this.focus();
    this.doCommand(selectAll);
    const tr = this.pm.state.tr;
    const domParser = new DOMParser();
    tr.deleteSelection().insert(
      0,
      ProseParser.fromSchema(this.schema).parse(
        domParser.parseFromString(content, 'text/html')
      )
    );
    this.pm.dispatch(tr);
  }

  doCommand(command: Command): boolean {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return command(this.pm.state, this.pm.view.dispatch, this.pm.view);
  }

  checkCommand(command: Command): boolean {
    return command(this.pm.state);
  }

  checkAndDoCommand(command: Command): boolean {
    if (command(this.pm.state)) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      return command(this.pm.state, this.pm.view.dispatch, this.pm.view);
    }
    return false;
  }

  isMarkActive(markType: MarkType) {
    const { from, $from, to, empty } = this.state.selection;
    if (empty) {
      return !!markType.isInSet(this.state.storedMarks || $from.marks());
    } else {
      return this.state.doc.rangeHasMark(from, to, markType);
    }
  }

  withTransaction(callback: (tr: Transaction) => Transaction | null) {
    const tr = this.state.tr;
    const result = callback(tr);
    if (result) {
      this.pm.view.dispatch(result);
    }
  }

  get datastore(): ProseStore {
    return this.pm.datastore;
  }

  get widgets() {
    return this.pm.widgets;
  }

  get schema(): Schema {
    return this.pm.state.schema;
  }

  get state(): EditorState {
    return this.pm.state;
  }

  get view(): EditorView {
    return this.pm.view;
  }

  get htmlContent(): string {
    console.log('DOCUMENT: ', this.pm.state.doc);
    const fragment = DOMSerializer.fromSchema(this.schema).serializeFragment(
      this.pm.state.doc.content,
      {
        document,
      }
    );
    const div = document.createElement('div');
    div.appendChild(fragment);
    return div.innerHTML;
  }
}

function textContent(resolvedNode: ResolvedPNode) {
  return resolvedNode.node.textContent;
}

function isText(schema: Schema) {
  return function (resolvedNode: ResolvedPNode) {
    const { node } = resolvedNode;
    if (getLinkMark(schema, node)) {
      return false;
    }
    return node.isText;
  };
}

function getLinkMark(schema: Schema, node: PNode): Mark | undefined {
  if (!schema.marks.link) {
    return undefined;
  }
  const linkMarks = filter(
    (markType: MarkType) => markType.spec.group === 'linkmarks',
    objectValues(schema.marks)
  );
  const isText = node.isText;
  if (isText) {
    for (const type of linkMarks) {
      const mark = type.isInSet(node.marks);
      if (mark) {
        return mark;
      }
    }
  }
  return undefined;
}

function children(schema: Schema) {
  return function (resolvedNode: ResolvedPNode): Iterable<ResolvedPNode> {
    const { node, pos: resolvedPos } = resolvedNode;
    if (node.isText) {
      const linkMark = getLinkMark(schema, node);
      if (linkMark) {
        return [
          {
            node: node.mark(linkMark.removeFromSet(node.marks)),
            pos: resolvedPos,
          },
        ];
      }
    }
    const root = resolvedPos ? resolvedPos.doc : node;
    const rslt: ResolvedPNode[] = [];
    node.descendants((child, relativePos) => {
      const absolutePos = resolvedPos
        ? resolvedPos.pos + 1 + relativePos
        : relativePos;
      rslt.push({
        node: child,
        pos: root.resolve(absolutePos),
      });
      return false;
    });
    return rslt;
  };
}

function tag(schema: Schema) {
  return function (resolvedNode: ResolvedPNode) {
    const { node } = resolvedNode;
    if (getLinkMark(schema, node)) {
      return 'a';
    }
    return node.type.name;
  };
}

function attributes(schema: Schema) {
  return function (resolvedNode: ResolvedPNode) {
    const { node } = resolvedNode;
    const linkMark = getLinkMark(schema, node);
    if (linkMark) {
      return linkMark.attrs;
    }
    return node.attrs;
  };
}

function getParent(
  resolvedNode: ResolvedPNode,
  resolvedRoot: ResolvedPNode
): ResolvedPNode | null {
  const { pos } = resolvedNode;
  if (!pos) {
    return null;
  }

  if (pos.depth === 0) {
    return { node: resolvedRoot.node };
  }
  return {
    node: pos.parent,
    pos: resolvedRoot.node.resolve(pos.before(pos.depth)),
  };
}
