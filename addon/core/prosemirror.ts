import { Command, EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import {
  DOMOutputSpec,
  DOMParser as ProseParser,
  MarkSpec,
  Node as PNode,
  NodeSpec,
  Schema,
} from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { selectAll, toggleMark } from 'prosemirror-commands';
import Datastore, {
  EditorStore,
} from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import { ParserNode } from '@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser';
import {
  getPathFromRoot,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';

const rdfaAttrs = {
  vocab: { default: undefined },
  typeof: { default: undefined },
  prefix: { default: undefined },
  property: { default: undefined },
  rel: { default: undefined },
  rev: { default: undefined },
  href: { default: undefined },
  about: { default: undefined },
  resource: { default: undefined },
  content: { default: undefined },
};

function getRdfaAttrs(node: Element) {
  const vocab = node.attributes.getNamedItem('vocab')?.value;
  const type = node.attributes.getNamedItem('typeof')?.value;
  const prefix = node.attributes.getNamedItem('prefix')?.value;
  const property = node.attributes.getNamedItem('property')?.value;
  const rel = node.attributes.getNamedItem('rel')?.value;
  const rev = node.attributes.getNamedItem('rev')?.value;
  const href = node.attributes.getNamedItem('href')?.value;
  const about = node.attributes.getNamedItem('about')?.value;
  const resource = node.attributes.getNamedItem('resource')?.value;
  const content = node.attributes.getNamedItem('content')?.value;
  if (
    vocab ||
    type ||
    prefix ||
    property ||
    rel ||
    rev ||
    href ||
    about ||
    resource ||
    content
  ) {
    return {
      vocab,
      typeof: type,
      prefix,
      property,
      rel,
      rev,
      href,
      about,
      resource,
      content,
      __tag: tagName(node),
    };
  }
  return false;
}

const pDOM: DOMOutputSpec = ['p', 0],
  blockquoteDOM: DOMOutputSpec = ['blockquote', 0],
  hrDOM: DOMOutputSpec = ['hr'],
  preDOM: DOMOutputSpec = ['pre', ['code', 0]],
  brDOM: DOMOutputSpec = ['br'];
// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
export const nodes = {
  /// NodeSpec The top level document node.
  doc: {
    content: 'block+',
  } as NodeSpec,

  /// A plain paragraph textblock. Represented in the DOM
  /// as a `<p>` element.
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
      return pDOM;
    },
  } as NodeSpec,
  rdfaInline: {
    inline: true,
    content: 'inline*',
    group: 'inline',
    attrs: {
      ...rdfaAttrs,
      __tag: { default: 'span' },
    },
    parseDOM: [
      {
        tag: 'span, a',
        getAttrs(node: HTMLElement) {
          return getRdfaAttrs(node);
        },
      },
    ],
    toDOM(node: PNode) {
      return [node.attrs.__tag, node.attrs, 0];
    },
  } as NodeSpec,
  rdfaBlock: {
    content: 'block*',
    group: 'block',
    attrs: {
      ...rdfaAttrs,
      __tag: { default: 'div' },
    },
    parseDOM: [
      {
        tag: 'div, h1, h2, h3, h4, h5, h6',
        getAttrs(node: HTMLElement) {
          return getRdfaAttrs(node);
        },
      },
    ],
    toDOM(node: PNode) {
      return [node.attrs.__tag, node.attrs, 0];
    },
  } as NodeSpec,

  /// A blockquote (`<blockquote>`) wrapping one or more blocks.
  blockquote: {
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM() {
      return blockquoteDOM;
    },
  } as NodeSpec,

  /// A horizontal rule (`<hr>`).
  horizontal_rule: {
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM() {
      return hrDOM;
    },
  } as NodeSpec,

  // /// A heading textblock, with a `level` attribute that
  // /// should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // /// `<h6>` elements.
  // heading: {
  //   attrs: { level: { default: 1 } },
  //   content: 'inline*',
  //   group: 'block',
  //   defining: true,
  //   parseDOM: [
  //     { tag: 'h1', attrs: { level: 1 } },
  //     { tag: 'h2', attrs: { level: 2 } },
  //     { tag: 'h3', attrs: { level: 3 } },
  //     { tag: 'h4', attrs: { level: 4 } },
  //     { tag: 'h5', attrs: { level: 5 } },
  //     { tag: 'h6', attrs: { level: 6 } },
  //   ],
  //   toDOM(node: Node) {
  //     return [`h${node.attrs.level}`, 0];
  //   },
  // } as NodeSpec,

  /// A code listing. Disallows marks or non-text inline
  /// nodes by default. Represented as a `<pre>` element with a
  /// `<code>` element inside of it.
  code_block: {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM() {
      return preDOM;
    },
  } as NodeSpec,

  /// The text node.
  text: {
    group: 'inline',
  } as NodeSpec,

  /// An inline image (`<img>`) node. Supports `src`,
  /// `alt`, and `href` attributes. The latter two default to the empty
  /// string.
  image: {
    inline: true,
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
    },
    group: 'inline',
    draggable: true,
    parseDOM: [
      {
        tag: 'img[src]',
        getAttrs(dom: HTMLElement) {
          return {
            src: dom.getAttribute('src'),
            title: dom.getAttribute('title'),
            alt: dom.getAttribute('alt'),
          };
        },
      },
    ],
    toDOM(node) {
      const { src, alt, title } = node.attrs;
      return ['img', { src, alt, title }];
    },
  } as NodeSpec,

  /// A hard line break, represented in the DOM as `<br>`.
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM() {
      return brDOM;
    },
  } as NodeSpec,
};

const emDOM: DOMOutputSpec = ['em', 0],
  strongDOM: DOMOutputSpec = ['strong', 0],
  codeDOM: DOMOutputSpec = ['code', 0];

/// [Specs](#model.MarkSpec) for the marks in the schema.
export const marks = {
  /// A link. Has `href` and `title` attributes. `title`
  /// defaults to the empty string. Rendered and parsed as an `<a>`
  /// element.
  link: {
    attrs: {
      href: {},
      title: { default: null },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs(dom: HTMLElement) {
          return {
            href: dom.getAttribute('href'),
            title: dom.getAttribute('title'),
          };
        },
      },
    ],
    toDOM(node) {
      const { href, title } = node.attrs;
      return ['a', { href, title }, 0];
    },
  } as MarkSpec,

  /// An emphasis mark. Rendered as an `<em>` element. Has parse rules
  /// that also match `<i>` and `font-style: italic`.
  em: {
    parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
    toDOM() {
      return emDOM;
    },
  } as MarkSpec,

  /// A strong mark. Rendered as `<strong>`, parse rules also match
  /// `<b>` and `font-weight: bold`.
  strong: {
    parseDOM: [
      { tag: 'strong' },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      {
        tag: 'b',
        getAttrs: (node: HTMLElement) =>
          node.style.fontWeight != 'normal' && null,
      },
      {
        style: 'font-weight',
        getAttrs: (value: string) =>
          /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
      },
    ],
    toDOM() {
      return strongDOM;
    },
  } as MarkSpec,

  /// Code font mark. Represented as a `<code>` element.
  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM() {
      return codeDOM;
    },
  } as MarkSpec,
};

/// This schema roughly corresponds to the document schema used by
/// [CommonMark](http://commonmark.org/), minus the list elements,
/// which are defined in the [`prosemirror-schema-list`](#schema-list)
/// module.
///
/// To reuse elements from this schema, extend or read from its
/// `spec.nodes` and `spec.marks` [properties](#model.Schema.spec).
export const rdfaSchema = new Schema({
  nodes,
  marks,
});
export const mySchema = new Schema({
  nodes: addListNodes(rdfaSchema.spec.nodes, 'block*', 'block'),
  marks: rdfaSchema.spec.marks,
});
export default class Prosemirror {
  view: EditorView;
  datastore: Datastore;
  root: Element;
  baseIRI: string;
  pathFromRoot: Node[];

  constructor(target: Element, baseIRI: string) {
    this.root = target;
    this.baseIRI = baseIRI;
    this.view = new EditorView(target, {
      state: EditorState.create({
        doc: ProseParser.fromSchema(mySchema).parse(target),
        // plugins: exampleSetup({ schema: mySchema }),
      }),
      attributes: {
        class: 'say-editor__inner say-content',
      },
      dispatchTransaction: this.dispatch,
    });
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
    return this.view.state;
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
    this.doCommand(toggleMark(mySchema.marks[name]));
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
      ProseParser.fromSchema(mySchema).parse(
        domParser.parseFromString(content, 'text/html')
      )
    );
    this.pm.dispatch(tr);
  }

  doCommand(command: Command) {
    command(this.pm.state, this.pm.view.dispatch, this.pm.view);
  }

  get xmlContent(): string {
    return '';
  }

  get xmlContentPrettified(): string {
    return '';
  }

  get htmlContent(): string {
    return this.pm.view.dom.outerHTML;
  }

  set xmlContent(content: string) {}
}
