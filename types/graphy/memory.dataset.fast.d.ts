declare module '@graphy/memory.dataset.fast' {
  import {Dataset, GraphTerm, ObjectTerm, PredicateTerm, Quad as RdfjsQuad, SubjectTerm} from 'rdfjs';
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

  export interface FastDataset extends Iterable<Quad> {
    size: number;

    isGraphyFastDataset: true;

    canonicalize(): FastDataset;

    add(quad: AnyQuad): FastDataset;

    addAll(quads: Dataset | AnyQuad []): FastDataset;

    addQuads(quads: Array<Quad>): number;

    delete(quad: AnyQuad): FastDataset;

    deleteQuads(quads: Array<Quad>): number;

    clear(): void;

    disjoint(other: FastDataset): boolean;

    union(other: Dataset): FastDataset;

    intersection(other: FastDataset): FastDataset;

    minus(other: FastDataset): FastDataset;

    difference(other: Dataset): FastDataset;

    match(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): FastDataset;

    equals(other: Dataset): boolean;

    has(quad: AnyQuad): boolean;
  }

}
