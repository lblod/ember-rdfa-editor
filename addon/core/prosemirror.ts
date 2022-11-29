import { Command, EditorState, Transaction } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';
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
import Datastore, {
  EditorStore,
  ProseStore,
} from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import { getPathFromRoot } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { rdfaSchema } from '@lblod/ember-rdfa-editor/core/schema';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { emDash, InputRule, inputRules } from 'prosemirror-inputrules';
import { gapCursor } from 'prosemirror-gapcursor';
import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import { defaultKeymap } from '@lblod/ember-rdfa-editor/core/keymap';
import tracked from 'tracked-built-ins/-private/decorator';
import { tableEditing } from 'prosemirror-tables';
import { dropCursor } from 'prosemirror-dropcursor';
import placeholder from '@lblod/ember-rdfa-editor/plugins/placeholder/placeholder';
import { hbs, TemplateFactory } from 'ember-cli-htmlbars';
import { createLogger, Logger } from '../utils/logging-utils';

export interface EmberInlineComponent
  extends Component,
    EmberInlineComponentArgs {
  appendTo(selector: string | Element): this;
}

export interface EmberInlineComponentArgs {
  getPos: () => number;
  node: PNode;
  updateAttribute: (attr: string, value: unknown) => void;
}

class DropdownView implements NodeView {
  dom: Element;
  emberComponent: EmberInlineComponent;
  template: TemplateFactory = hbs`
      <InlineComponentsPlugin::Dropdown @getPos={{this.getPos}}/>`;

  constructor(pNode: PNode, view: EditorView, getPos: () => number) {
    const { node, component } = emberComponent('dropdown', this.template, {
      getPos,
      node: pNode,
      updateAttribute: (attr, value) => {
        const transaction = view.state.tr;
        transaction.setNodeAttribute(getPos(), attr, value);
        view.dispatch(transaction);
      },
    });
    this.dom = node;
    this.emberComponent = component;
  }

  destroy() {
    this.emberComponent.destroy();
  }

  stopEvent() {
    return true;
  }
}

class CounterView implements NodeView {
  node: PNode;
  dom: Element;
  emberComponent: EmberInlineComponent;
  template: TemplateFactory = hbs`
      <InlineComponentsPlugin::Counter @getPos={{this.getPos}} @node={{this.node}}
                                       @updateAttribute={{this.updateAttribute}}/>`;

  constructor(pNode: PNode, view: EditorView, getPos: () => number) {
    this.node = pNode;
    const { node, component } = emberComponent('counter', this.template, {
      getPos,
      node: pNode,
      updateAttribute: (attr, value) => {
        const transaction = view.state.tr;
        transaction.setNodeAttribute(getPos(), attr, value);
        view.dispatch(transaction);
      },
    });
    this.dom = node;
    this.emberComponent = component;
  }

  update(node: PNode) {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.emberComponent.set('node', node);
    return true;
  }

  destroy() {
    this.emberComponent.destroy();
  }

  stopEvent() {
    return true;
  }
}

function emberComponent(
  name: string,
  template: TemplateFactory,
  props: EmberInlineComponentArgs
): { node: HTMLElement; component: EmberInlineComponent } {
  const instance = window.__APPLICATION;
  const componentName = `${name}-${uuidv4()}`;
  instance?.register(
    `component:${componentName}`,
    // eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
    Component.extend({
      layout: template,
      tagName: '',
      ...props,
    })
  );
  const component = instance?.lookup(
    `component:${componentName}`
  ) as EmberInlineComponent; // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const node = document.createElement('span');
  component.appendTo(node);
  return { node, component };
}

export default class Prosemirror {
  view: EditorView;
  @tracked _state;
  @tracked datastore: ProseStore;
  root: Element;
  baseIRI: string;
  pathFromRoot: Node[];
  schema: Schema;
  private readonly tag: (node: PNode) => string;
  private readonly children: (node: PNode) => Iterable<PNode>;
  private readonly attributes: (node: PNode) => Attrs;
  private readonly isText: (node: PNode) => boolean;
  private logger: Logger;

  constructor(target: Element, schema: Schema, baseIRI: string) {
    this.logger = createLogger(this.constructor.name);
    this.root = target;
    this.baseIRI = baseIRI;
    this.schema = schema;
    this.view = new EditorView(target, {
      state: EditorState.create({
        doc: ProseParser.fromSchema(schema).parse(target),
        plugins: [
          inputRules({
            rules: [
              emDash,
              new InputRule(/yeet/g, () => {
                console.log('found matching input');
                return null;
              }),
            ],
          }),
          placeholder(),
          dropCursor(),
          gapCursor(),
          keymap(defaultKeymap(schema)),
          keymap(baseKeymap),
          history(),
          tableEditing({ allowTableNodeSelection: false }),
        ],
      }),
      attributes: { class: 'say-editor__inner say-content' },
      nodeViews: {
        dropdown(node, view, getPos) {
          return new DropdownView(node, view, getPos);
        },
        counter(node, view, getPos) {
          return new CounterView(node, view, getPos);
        },
      },
      dispatchTransaction: this.dispatch,
    });
    this._state = this.view.state;
    this.pathFromRoot = getPathFromRoot(this.root, false);
    this.tag = tag(this.schema);
    this.children = children(this.schema);
    this.attributes = attributes(this.schema);
    this.isText = isText(this.schema);
    this.datastore = EditorStore.fromParse<PNode>({
      root: this._state.doc,
      textContent,
      tag: this.tag,
      children: this.children,
      attributes: this.attributes,
      isText: this.isText,
      getParent,

      pathFromDomRoot: this.pathFromRoot,
      baseIRI,
    });
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

    this.view.updateState(newState);
    if (tr.docChanged) {
      this.datastore = EditorStore.fromParse({
        textContent,
        tag: this.tag,
        children: this.children,
        attributes: this.attributes,
        isText: this.isText,
        getParent,
        root: newState.doc,
        pathFromDomRoot: this.pathFromRoot,
        baseIRI: this.baseIRI,
      });
      this.logger(`Parsed ${this.datastore.size} triples`);
    }

    this._state = newState;
  };
}

export class ProseController {
  constructor(private pm: Prosemirror) {}

  toggleMark(name: string) {
    this.focus();
    this.doCommand(toggleMark(rdfaSchema.marks[name]));
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
      ProseParser.fromSchema(rdfaSchema).parse(
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
    return false;
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

  get datastore(): Datastore<PNode> {
    return this.pm.datastore;
  }

  get schema(): Schema {
    return this.pm.state.schema;
  }

  get state(): EditorState {
    return this.pm.state;
  }

  get xmlContent(): string {
    return '';
  }

  set xmlContent(content: string) {}

  get xmlContentPrettified(): string {
    return '';
  }

  get htmlContent(): string {
    const fragment = DOMSerializer.fromSchema(rdfaSchema).serializeFragment(
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

function textContent(node: PNode) {
  return node.textContent;
}

function isText(schema: Schema) {
  return function (node: PNode) {
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
  const isText = node.isText;
  if (isText) {
    return schema.marks.link.isInSet(node.marks);
  }
  return undefined;
}

function children(schema: Schema) {
  return function (node: PNode): Iterable<PNode> {
    if (node.isText) {
      const linkMark = getLinkMark(schema, node);
      if (linkMark) {
        return [node.mark(linkMark.removeFromSet(node.marks))];
      }
    }
    const rslt: PNode[] = [];
    node.forEach((child) => rslt.push(child));
    return rslt;
  };
}

function tag(schema: Schema) {
  return function (node: PNode) {
    if (getLinkMark(schema, node)) {
      return 'a';
    }
    return node.type.name;
  };
}

function attributes(schema: Schema) {
  return function (node: PNode) {
    const linkMark = getLinkMark(schema, node);
    if (linkMark) {
      return linkMark.attrs;
    }
    return node.attrs;
  };
}

function getParent(node: PNode, root: PNode): PNode | null {
  if (node === root) {
    return null;
  }
  let found = false;
  root.descendants((descendant: PNode) => {
    if (descendant === node) {
      found = true;
    }
    return !found;
  });
  return null;
}
