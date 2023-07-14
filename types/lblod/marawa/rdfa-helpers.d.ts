declare module '@lblod/marawa/rdfa-helpers' {
  import RichNode from '@lblod/marawa/rich-node';
  import RdfaAttributes from '@lblod/marawa/rdfa-attributes';

  export function enrichWithRdfaProperties(
    richNode: RichNode,
    parentContext: RdfaAttributes[],
    parentPrefixes?: unknown,
    options?: Record<string, unknown>,
  ): void;
  export function resolvePrefix(
    attribute: string,
    uri: string | string[],
    prefixes: unknown,
    documentUri?: string,
  ): string;
  export function rdfaAttributesToTriples(
    rdfaAttributes: RdfaAttributes[],
  ): unknown[];
  export function isFullUri(uri: string): boolean;
  export function isPrefixedUri(uri: string): boolean;
}
