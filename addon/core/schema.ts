import {
  Fragment,
  MarkSpec,
  Node as PNode,
  NodeSpec,
  Schema,
} from 'prosemirror-model';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { bulletList, listItem, orderedList } from 'prosemirror-schema-list';
import { tableNodes } from './table-nodes';
import { PLACEHOLDER_CLASS } from '@lblod/ember-rdfa-editor/utils/constants';

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


// const emberComponentSpec: (inline: boolean, atomic: boolean) => NodeSpec = (
//   inline,
//   atomic
// ) => {
//   return {
//     inline,
//     group: inline ? 'inline' : 'block',
//     atom: atomic,
//     parseDom: [
//       {
//         tag: inline ? 'span' : 'div',
//         getAttrs(node: HTMLElement) {
//           if (
//             node.dataset.inlineComponent &&
//             !node.querySelector(INLINE_COMPONENT_CHILDREN_SELECTOR) === atomic
//           ) {
//             return {};
//           }
//           return false;
//         },
//         ...(atomic && {
//           getContent(node: HTMLElement, schema: Schema) {
//             const childrenWrapper = unwrap(
//               node.querySelector(INLINE_COMPONENT_CHILDREN_SELECTOR)
//             );
//             const parsedChildNodes = [...childrenWrapper.childNodes].map(
//               (childNode) => ProseParser.fromSchema(schema).parse(childNode)
//             );
//             return Fragment.fromArray(parsedChildNodes);
//           },
//         }),
//       },
//     ],
//   };
// };

const doc: NodeSpec = {
  content: 'block+',
};
const paragraph: NodeSpec = {
  content: 'inline*',
  group: 'block',
  parseDOM: [{ tag: 'p' }],
  toDOM() {
    return ['p', 0];
  },
};

const ordered_list: NodeSpec = {
  ...orderedList,
  content: 'list_item+',
  group: 'block',
};
const bullet_list: NodeSpec = {
  ...bulletList,
  content: 'list_item+',
  group: 'block',
};
const list_item: NodeSpec = {
  ...listItem,
  content: 'paragraph block*',
};
const inline_rdfa: NodeSpec = {
  inline: true,
  content: 'inline*',
  draggable: true,
  defining: true,
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
};
const block_rdfa: NodeSpec = {
  content: 'block*',
  group: 'block',
  attrs: {
    ...rdfaAttrs,
    __tag: { default: 'div' },
  },
  defining: true,
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
};
const blockquote: NodeSpec = {
  content: 'block+',
  group: 'block',
  defining: true,
  parseDOM: [{ tag: 'blockquote' }],
  toDOM() {
    return ['blockquote', 0];
  },
};
const horizontal_rule: NodeSpec = {
  group: 'block',
  parseDOM: [{ tag: 'hr' }],
  toDOM() {
    return ['hr'];
  },
};
const heading: NodeSpec = {
  attrs: { level: { default: 1 } },
  content: 'inline*',
  group: 'block',
  defining: true,
  parseDOM: [
    { tag: 'h1', attrs: { level: 1 } },
    { tag: 'h2', attrs: { level: 2 } },
    { tag: 'h3', attrs: { level: 3 } },
    { tag: 'h4', attrs: { level: 4 } },
    { tag: 'h5', attrs: { level: 5 } },
    { tag: 'h6', attrs: { level: 6 } },
  ],
  toDOM(node: PNode) {
    return [`h${node.attrs.level}`, 0];
  },
};
const code_block: NodeSpec = {
  content: 'text*',
  marks: '',
  group: 'block',
  code: true,
  defining: true,
  parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
  toDOM() {
    return ['pre', ['code', 0]];
  },
};
const text: NodeSpec = {
  group: 'inline',
};
const image: NodeSpec = {
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
  toDOM(node: PNode) {
    const { src, alt, title } = node.attrs;
    return ['img', { src, alt, title }];
  },
};

const placeholder: NodeSpec = {
  inline: true,
  content: 'inline*',
  group: 'inline',
  attrs: {
    placeholderText: { default: 'placeholder' },
  },
  selectable: false,

  parseDOM: [
    {
      tag: 'span',

      getContent(node: Node, schema: Schema) {
        return Fragment.empty;
      },
      getAttrs(node: HTMLElement) {
        if (node.classList.contains(PLACEHOLDER_CLASS)) {
          return { placeholderText: node.innerText };
        }
        return false;
      },
    },
  ],
  toDOM(node: PNode) {
    if (node.childCount > 0) {
      return ['span', {}, 0];
    } else {
      return ['span', { class: PLACEHOLDER_CLASS }, node.attrs.placeholderText];
    }
  },
};
const hard_break: NodeSpec = {
  inline: true,
  group: 'inline',
  selectable: false,
  parseDOM: [{ tag: 'br' }],
  toDOM() {
    return ['br'];
  },
};
// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
export const nodes = {
  doc,
  placeholder,
  paragraph,
  list_item,
  ...tableNodes({
    tableGroup: 'block',
    cellContent: 'inline+',
    cellAttributes: {},
  }),
  ordered_list,
  bullet_list,
  inline_rdfa,
  block_rdfa,
  /// A blockquote (`<blockquote>`) wrapping one or more blocks.
  blockquote,

  /// A horizontal rule (`<hr>`).
  horizontal_rule,

  /// A code listing. Disallows marks or non-text inline
  /// nodes by default. Represented as a `<pre>` element with a
  /// `<code>` element inside of it.
  code_block,

  /// The text node.
  text,

  /// An inline image (`<img>`) node. Supports `src`,
  /// `alt`, and `href` attributes. The latter two default to the empty
  /// string.
  image,

  /// A hard line break, represented in the DOM as `<br>`.
  hard_break,
};

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
      return ['em', 0];
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
      return ['strong', 0];
    },
  } as MarkSpec,

  /// Code font mark. Represented as a `<code>` element.
  underline: {
    parseDOM: [{ tag: 'u' }],
    toDOM() {
      return ['u', 0];
    },
  } as MarkSpec,
  strikethrough: {
    parseDOM: [{ tag: 's' }, { tag: 'del' }],
    toDOM() {
      return ['del', 0];
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
