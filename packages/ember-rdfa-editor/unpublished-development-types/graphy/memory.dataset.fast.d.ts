declare module '@graphy/memory.dataset.fast' {
  import type * as RDF from '@rdfjs/types';
  export type TermType = 'NamedNode' | 'BlankNode' | 'Literal' | 'DefaultGraph';

  export type AnyQuad = RDF.Quad;

  export type TermIsolate = AnyTerm;
  export type QuadIsolate = AnyQuad;

  export interface Quad extends AnyQuad {
    equals(other: AnyQuad): boolean;

    verbose(): string;

    terse(prefixes: string): string;

    concise(prefixes: string): string;

    isolate(): QuadIsolate;
  }

  export interface AnyTerm {
    termType: TermType;
    value: string;
    datatype?: AnyTerm;
    language?: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DatasetConfig {
    //TODO
  }

  export default function dataset(config?: DatasetConfig): FastDataset;

  export interface FastDataset extends Iterable<Quad> {
    size: number;

    isGraphyFastDataset: true;

    canonicalize(): FastDataset;

    add(quad: AnyQuad): FastDataset;

    addAll(quads: RDF.Dataset | AnyQuad[]): FastDataset;

    addQuads(quads: Array<Quad>): number;

    delete(quad: AnyQuad): FastDataset;

    clear(): void;

    disjoint(other: FastDataset): boolean;

    union(other: FastDataset): FastDataset;

    intersection(other: FastDataset): FastDataset;

    minus(other: FastDataset): FastDataset;

    difference(other: FastDataset): FastDataset;

    match(
      subject?: RDF.Quad_Subject | null,
      predicate?: RDF.Quad_Predicate | null,
      object?: RDF.Quad_Object | null,
      graph?: RDF.Quad_Graph | null,
    ): FastDataset;

    equals(other: FastDataset): boolean;

    has(quad: AnyQuad): boolean;
  }
}
