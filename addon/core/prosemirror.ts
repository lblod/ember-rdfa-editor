import { Command, EditorState, Transaction } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';
import {
  DOMParser as ProseParser,
  DOMSerializer,
  MarkType,
  Node as PNode,
  Schema,
} from 'prosemirror-model';
import { baseKeymap, selectAll, toggleMark } from 'prosemirror-commands';
import Datastore, {
  EditorStore,
} from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import { ParserNode } from '@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser';
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
import placeholder from '@lblod/ember-rdfa-editor/plugins/placeholder/placeholder';
import { dropCursor } from 'prosemirror-dropcursor';
import { hbs, TemplateFactory } from 'ember-cli-htmlbars';

export interface EmberInlineComponent extends Component {
  appendTo(selector: string | Element): this;
}

class DropdownView implements NodeView {
  dom: Element;
  emberComponent: EmberInlineComponent;
  template: TemplateFactory = hbs`<InlineComponentsPlugin::Dropdown/>`;

  constructor(_node: PNode, _view: EditorView, _getPos: () => number) {
    const { node, component } = emberComponent('dropdown', this.template);
    node.dataset.inlineComponent = 'dropdown';
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

function emberComponent(
  name: string,
  template: TemplateFactory
): { node: HTMLElement; component: EmberInlineComponent } {
  const instance = window.__APPLICATION;
  const componentName = `${name}-${uuidv4()}`;
  instance?.register(
    `component:${componentName}`,
    // eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
    Component.extend({
      layout: template,
      tagName: '',
    })
  );
  const component = instance?.lookup(
    `component:${componentName}`
  ) as EmberInlineComponent; // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  // component.set('componentController', new InlineComponentController(this));
  // component.set('editorController', this.spec.controller);
  const node = document.createElement('span');
  component.appendTo(node);
  return { node, component };
}

export default class Prosemirror {
  view: EditorView;
  @tracked _state;
  @tracked datastore: Datastore;
  root: Element;
  baseIRI: string;
  pathFromRoot: Node[];

  constructor(target: Element, baseIRI: string) {
    this.root = target;
    this.baseIRI = baseIRI;
    this.view = new EditorView(target, {
      state: EditorState.create({
        doc: ProseParser.fromSchema(rdfaSchema).parse(target),
        plugins: [
          placeholder(),
          inputRules({
            rules: [
              emDash,
              new InputRule(/yeet/g, () => {
                console.log('found matching input');
                return null;
              }),
            ],
          }),
          dropCursor(),
          gapCursor(),
          keymap(defaultKeymap(rdfaSchema)),
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
      },
      dispatchTransaction: this.dispatch,
    });
    this._state = this.view.state;
    this.pathFromRoot = getPathFromRoot(this.root, false);
    this.datastore = EditorStore.fromParse({
      modelRoot: intoParsableDoc(
        this.view.state.doc,
        this.view.state.doc,
        -1,
        new Map()
      ),
      pathFromDomRoot: this.pathFromRoot,
      baseIRI,
    });
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
      this.datastore = EditorStore.fromParse({
        modelRoot: intoParsableDoc(newState.doc, newState.doc, -1, new Map()),
        baseIRI: this.baseIRI,
        pathFromDomRoot: this.pathFromRoot,
      });
      console.log([...this.datastore.asQuads()]);
    }

    this.view.updateState(newState);
    this._state = newState;
  };
}

function intoParsableDoc(
  root: PNode,
  doc: PNode,
  pos: number,
  memo: Map<PNode, ParserNode & { original: PNode }>
): ParserNode & { original: PNode } {
  const stored = memo.get(doc);
  if (stored) {
    return stored;
  }
  const result = {
    original: doc,
    isText(): boolean {
      return doc.isText;
    },
    isElement(): boolean {
      return !doc.isLeaf;
    },
    attributeMap: new Map(Object.entries(doc.attrs)),
    content: doc.text || '',
    type: doc.type.name,
    getFirstChild(): ParserNode | null {
      const firstChild = doc.firstChild;
      if (firstChild) {
        const rpos = root.resolve(pos + 1);
        return intoParsableDoc(root, firstChild, rpos.posAtIndex(0), memo);
      }
      return null;
    },
    getLastChild(): ParserNode | null {
      const lastChild = doc.lastChild;
      if (lastChild) {
        const rpos = root.resolve(pos + 1);
        return intoParsableDoc(root, lastChild, rpos.posAtIndex(0), memo);
      }
      return null;
    },
    getNextSibling(): ParserNode | null {
      if (pos === -1) {
        return null;
      }
      const rPos = root.resolve(pos);
      const nextSib = rPos.nodeAfter;
      if (nextSib) {
        const nextSibPos = rPos.posAtIndex(rPos.index() + 1);
        return intoParsableDoc(root, nextSib, nextSibPos, memo);
      }
      return null;
    },
    getPreviousSibling(): ParserNode | null {
      if (pos === -1) {
        return null;
      }
      const rPos = root.resolve(pos);

      const prevSib = rPos.nodeBefore;
      if (prevSib) {
        const prevSibPos = rPos.posAtIndex(rPos.index() - 1);
        return intoParsableDoc(root, prevSib, prevSibPos, memo);
      }
      return null;
    },
    getParent(): ParserNode | null {
      if (pos === -1) {
        return null;
      }
      const rpos = root.resolve(pos);
      const parent = rpos.parent;

      return intoParsableDoc(
        root,
        parent,
        rpos.depth === 0 ? -1 : rpos.before(),
        memo
      );
    },
  };
  memo.set(doc, result);
  return result;
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
    return command(this.pm.state, this.pm.view.dispatch, this.pm.view);
  }

  checkCommand(command: Command): boolean {
    return command(this.pm.state);
  }

  checkAndDoCommand(command: Command): boolean {
    if (command(this.pm.state)) {
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

  get schema(): Schema {
    return this.pm.state.schema;
  }

  get state(): EditorState {
    return this.pm.state;
  }

  get xmlContent(): string {
    return '';
  }

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
    console.log('FRAGMENT: ', fragment);
    const div = document.createElement('div');
    div.appendChild(fragment);
    return div.innerHTML;
  }

  set xmlContent(content: string) {}
}
