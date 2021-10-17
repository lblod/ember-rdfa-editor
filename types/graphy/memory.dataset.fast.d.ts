declare module '@graphy/memory.dataset.fast' {
  export type TermType = 'NamedNode' | 'BlankNode' | 'Literal' | 'DefaultGraph';

  export interface AnyQuad {
    subject: AnyTerm;
    predicate: AnyTerm;
    object: AnyTerm;
    graph?: AnyTerm
  }

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
  export interface DatasetConfig {

  }

  export default function dataset(config?: DatasetConfig): FastDataset;

  export interface FastDataset extends Iterable<Quad> {
    size: number;

    canonicalize(): FastDataset;

    add(quad: AnyQuad): this;

    addAll(quads: FastDataset | Array<AnyQuad>): this;

    addQuads(quads: Array<Quad>): number;

    delete(quad: AnyQuad): this;

    deleteQuads(quads: Array<Quad>): number;

    clear(): void;

    has(quad: AnyQuad): boolean;

    equals(other: FastDataset): boolean;

    contains(other: FastDataset): boolean;

    disjoint(other: FastDataset): boolean;

    union(other: FastDataset): FastDataset;

    intersection(other: FastDataset): FastDataset;

    minus(other: FastDataset): FastDataset;

    difference(other: FastDataset): FastDataset;

    match(subject: AnyTerm | null): FastDataset;

    match(subject: AnyTerm | null, predicate: AnyTerm | null): FastDataset;

    match(subject: AnyTerm | null, predicate: AnyTerm | null, object: AnyTerm | null): FastDataset;

    match(subject: AnyTerm | null, predicate: AnyTerm | null, object: AnyTerm | null, graph: AnyTerm | null): FastDataset;

    [Symbol.iterator](): Iterator<Quad>;


  }
}
