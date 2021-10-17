declare module '@graphy/memory.dataset.fast' {
  import SimpleDataset = Rdfjs.SimpleDataset;
  import SubjectTerm = Rdfjs.SubjectTerm;
  import PredicateTerm = Rdfjs.PredicateTerm;
  import ObjectTerm = Rdfjs.ObjectTerm;
  import GraphTerm = Rdfjs.GraphTerm;
  export type TermType = 'NamedNode' | 'BlankNode' | 'Literal' | 'DefaultGraph';

  export type AnyQuad = Rdfjs.Quad;

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

    addAll(quads: SimpleDataset | Quad []): FastDataset;

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
