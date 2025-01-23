declare module '@lblod/marawa/rdfa-context-scanner' {
  import RdfaBlock from '@lblod/marawa/rdfa-block';

  type Region = [number, number];
  export default class RdfaContextScanner {
    analyse(domNode: Node, region?: Region, options?: unknown): RdfaBlock[];
  }
  export function analyse(
    node: Node,
    region?: Region,
    options?: unknown,
  ): RdfaBlock[];
}
