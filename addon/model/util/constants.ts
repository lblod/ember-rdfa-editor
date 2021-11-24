export const NON_BLOCK_NODES = new Set(['b', 'strong', 'i', 'em', 'span', 'a']);
export const LIST_TYPES = new Set(['li', 'ul', 'ol']);
export const LIST_CONTAINERS = new Set(['ul', 'ol']);
export const TABLE_TYPES = new Set(['table', 'th', 'tr', 'td', 'thead', 'tbody']);
export const TABLE_CELLS = new Set(['th', 'td']);
export const TEXT_PROPERTY_NODES = new Set(['b', 'strong', 'i', 'emph', 'u', 'del', 'span']);

export const SPACE = ' ';
export const NON_BREAKING_SPACE = '\u00A0';
export const INVISIBLE_SPACE = '\u200B';

export const HIGHLIGHT_ATTRIBUTE = 'data-editor-highlight';
export const PLACEHOLDER_CLASS = 'mark-highlight-manual';
export const CORE_OWNER = 'rdfa-editor';

export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const XSD_PREFIX = 'http://www.w3.org/2001/XMLSchema#';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = () => {};
