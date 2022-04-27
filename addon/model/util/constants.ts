import { highlightMarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import { SpecAttributes } from '@lblod/ember-rdfa-editor/model/marks-registry';
import { boldMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/italic';
import { underlineMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/underline';
import { strikethroughMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/strikethrough';
import { TextAttribute } from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';

// based on https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#phrasing_content
// we've added a, del, ins to the list since we assume they only contain phrasing content in the editor
// we've removed br from the list to be inline with editor behaviour, which treats it as a block
export const PHRASING_CONTENT = [
  'a',
  'abbr',
  'audio',
  'b',
  'bdo',
  'button',
  'canvas',
  'cite',
  'code',
  'command',
  'data',
  'datalist',
  'del',
  'dfn',
  'em',
  'embed',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'mark',
  'math',
  'meter',
  'noscript',
  'object',
  'output',
  'picture',
  'progress',
  'q',
  'ruby',
  'samp',
  'script',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'svg',
  'textarea',
  'time',
  'u',
  'var',
  'video',
  'wbr',
];
export const NON_BLOCK_NODES = new Set(PHRASING_CONTENT);
export const LIST_TYPES = new Set(['li', 'ul', 'ol']);
export const LIST_CONTAINERS = new Set(['ul', 'ol']);
export const TABLE_TYPES = new Set([
  'table',
  'th',
  'tr',
  'td',
  'thead',
  'tbody',
]);
export const TABLE_CELLS = new Set(['th', 'td']);
export const TEXT_PROPERTY_NODES = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  'del',
  'span',
]);
export const LEAF_NODES = new Set(['br', 'img', 'hr']);

export const SPACE = ' ';
export const NON_BREAKING_SPACE = '\u00A0';
export const INVISIBLE_SPACE = '\u200B';

export const PLACEHOLDER_CLASS = 'mark-highlight-manual';
export const CORE_OWNER = 'rdfa-editor';

export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const USES_VOCAB_PREDICATE = 'http://www.w3.org/ns/rdfa#usesVocabulary';
export const XSD_PREFIX = 'http://www.w3.org/2001/XMLSchema#';
export const LUMP_NODE_PROPERTY =
  'http://lblod.data.gift/vocabularies/editor/isLumpNode';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = () => {};
export const compatTextAttributeMap: Map<TextAttribute, SpecAttributes> =
  new Map([
    ['bold', { spec: boldMarkSpec, attributes: {} }],
    ['italic', { spec: italicMarkSpec, attributes: {} }],
    ['underline', { spec: underlineMarkSpec, attributes: {} }],
    ['strikethrough', { spec: strikethroughMarkSpec, attributes: {} }],
    ['highlighted', { spec: highlightMarkSpec, attributes: {} }],
  ]);
