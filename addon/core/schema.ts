import { Schema } from 'prosemirror-model';
import {
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/core/list-nodes';
import { hard_break } from '@lblod/ember-rdfa-editor/nodes/hard-break';
import { image } from '@lblod/ember-rdfa-editor/nodes/image';
import { text } from '@lblod/ember-rdfa-editor/nodes/text';
import { code_block } from '@lblod/ember-rdfa-editor/nodes/code-block';
import { heading } from '@lblod/ember-rdfa-editor/nodes/heading';
import { horizontal_rule } from '@lblod/ember-rdfa-editor/nodes/horizontal-rule';
import { blockquote } from '@lblod/ember-rdfa-editor/nodes/blockquote';
import { block_rdfa } from '@lblod/ember-rdfa-editor/nodes/block-rdfa';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import { repaired_block } from '@lblod/ember-rdfa-editor/nodes/repaired-block';
import { paragraph } from '@lblod/ember-rdfa-editor/nodes/paragraph';
import { strikethrough } from '@lblod/ember-rdfa-editor/marks/strikethrough';
import { underline } from '@lblod/ember-rdfa-editor/marks/underline';
import { strong } from '@lblod/ember-rdfa-editor/marks/strong';
import { em } from '@lblod/ember-rdfa-editor/marks/em';
import { link } from '@lblod/ember-rdfa-editor/marks/link';
import { doc } from '@lblod/ember-rdfa-editor/nodes/doc';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
export const nodes = {
  doc,
  paragraph,

  repaired_block,

  list_item,
  ordered_list,
  bullet_list,
  /// A blockquote (`<blockquote>`) wrapping one or more blocks.
  heading,
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
  inline_rdfa,
  block_rdfa,
};

/// [Specs](#model.MarkSpec) for the marks in the schema.
export const marks = {
  link,
  em,
  strong,
  underline,
  strikethrough,
};

export const rdfaSchema = new Schema({
  nodes,
  marks,
});
export const rdfaAttrs = {
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
  datatype: { default: undefined },
  lang: { default: undefined },
  xmlns: { default: undefined },
  src: { default: undefined },
  id: { default: undefined },
  role: { default: undefined },
  inlist: { default: undefined },
  datetime: { default: undefined },
};

export function getRdfaAttrs(node: Element) {
  const attrs: Record<string, string> = {};
  let hasAnyRdfaAttributes = false;
  for (const key of Object.keys(rdfaAttrs)) {
    const value = node.attributes.getNamedItem(key)?.value;
    if (value) {
      attrs[key] = value;
      hasAnyRdfaAttributes = true;
    }
  }
  if (hasAnyRdfaAttributes) {
    return attrs;
  }
  return false;
}
