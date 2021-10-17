declare module '@graphy/memory.dataset.fast' {
  import {GraphTerm, ObjectTerm, PredicateTerm, Quad as RdfjsQuad, SimpleDataset, SubjectTerm} from 'rdfjs';
  export type TermType = 'NamedNode' | 'BlankNode' | 'Literal' | 'DefaultGraph';

  export type AnyQuad = RdfjsQuad;

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

  export interface FastDataset extends SimpleDataset {

    canonicalize(): FastDataset;

    add(quad: AnyQuad): FastDataset;

    addAll(quads: SimpleDataset | AnyQuad []): FastDataset;

    addQuads(quads: Array<Quad>): number;

    delete(quad: AnyQuad): FastDataset;

    deleteQuads(quads: Array<Quad>): number;

    clear(): void;

    disjoint(other: FastDataset): boolean;

    union(other: SimpleDataset): FastDataset;

    intersection(other: SimpleDataset): FastDataset;

    minus(other: FastDataset): FastDataset;

    difference(other: SimpleDataset): FastDataset;

    match(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): FastDataset;

  }
}
