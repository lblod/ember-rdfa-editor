/**
 * based on https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#phrasing_content
 * we've added a, del, ins to the list since we assume they only contain phrasing content in the editor
 * we've removed br from the list to be inline with editor behaviour, which treats it as a block
 **/

export const HEADING_ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
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
/**
 * List of element types which can be used in non-block (phrasing) context.
 * Unlike PHRASING_CONTENT also includes br tag as while it's normally handled as a block by the
 * editor, it's also used for 'soft breaks' (when adding a newline with shift-enter), so we include
 * it here.
 **/
export const NON_BLOCK_NODES = [...PHRASING_CONTENT, 'br'];
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

export const VISUAL_NODES = new Set([
  'br',
  'img',
  'hr',
  'li',
  'td',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'div',
  'pre',
  'address',
  'blockquote',
]);

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
export const INLINE_COMPONENT_CHILDREN_SELECTOR = '[data-slot]';
export const LANG_STRING =
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString';
export const RDFA_ATTRIBUTES = [
  'resource',
  'about',
  'rel',
  'rev',
  'content',
  'datatype',
  'property',
  'href',
  'src',
  'inlist',
  'prefix',
  'vocab',
  'typeof',
  'lang',
];
