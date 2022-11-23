import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Node, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { toggleMark } from 'prosemirror-commands';
import Datastore, {
  EditorStore,
} from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import { ParserNode } from '@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser';
import { getPathFromRoot } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

export default class Prosemirror {
  view: EditorView;
  datastore: Datastore;
  root: Element;

  constructor(target: Element) {
    this.root = target;
    this.view = new EditorView(target, {
      state: EditorState.create({
        doc: DOMParser.fromSchema(mySchema).parse(target),
        // plugins: exampleSetup({ schema: mySchema }),
      }),
      attributes: {
        class: 'say-editor__inner say-content',
      },
      dispatchTransaction: this.dispatch,
    });
    this.datastore = EditorStore.fromParse({
      modelRoot: intoParsableDoc(
        this.view.state.doc,
        this.view.state.doc,
        -1,
        new Map()
      ),
      pathFromDomRoot: getPathFromRoot(this.root, false),
      baseIRI: 'test',
    });
  }

  get state() {
    return this.view.state;
  }

  focus() {
    this.view.focus();
  }

  dispatch = (tr: Transaction) => {
    const newState = this.state.apply(tr);
    console.log(newState.doc.toString());
    this.datastore = EditorStore.fromParse({
      modelRoot: intoParsableDoc(newState.doc, newState.doc, -1, new Map()),
      baseIRI: 'test',
      pathFromDomRoot: getPathFromRoot(this.root, false),
    });
    console.log([...this.datastore.asQuads()]);

    this.view.updateState(newState);
  };
}

function intoParsableDoc(
  root: Node,
  doc: Node,
  pos: number,
  memo: Map<Node, ParserNode & { original: Node }>
): ParserNode & { original: Node } {
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
    this.pm.focus();
    toggleMark(mySchema.marks[name])(
      this.pm.state,
      this.pm.view.dispatch,
      this.pm.view
    );
  }
}
