declare namespace Rdfjs {

  export interface Term {
    termType: string;
    value: string;

    equals(other?: Term): boolean;
  }

  export interface NamedNode extends Term {
    termType: "NamedNode";
  }

  export interface BlankNode extends Term {
    termType: "BlankNode";
  }

  export interface Literal extends Term {
    termType: "Literal";
    language: string;
    datatype: NamedNode;
  }

  export interface Variable extends Term {
    termType: "Variable";
  }

  export interface DefaultGraph extends Term {
    termType: "DefaultGraph";
    value: "";
  }

  export type SubjectTerm = NamedNode | BlankNode | Variable | Quad;
  export type PredicateTerm = NamedNode | Variable;
  export type ObjectTerm = NamedNode | Literal | BlankNode | Variable;
  export type GraphTerm = DefaultGraph | NamedNode | BlankNode | Variable;

  export interface Quad extends Term {
    termType: "Quad";
    value: "";
    subject: SubjectTerm;
    predicate: PredicateTerm;
    object: ObjectTerm;
    graph: GraphTerm;

    equals(other?: Quad): boolean;
  }

  export interface DataFactory {
    namedNode(value: string): NamedNode;

    blankNode(value?: string): BlankNode;

    literal(value: string, languageOrDatatype?: string | NamedNode): Literal;

    variable(value: string): Variable;

    defaultGraph(): DefaultGraph;

    quad(subject: SubjectTerm, predicate: PredicateTerm, object: ObjectTerm, graph?: GraphTerm): Quad;

    fromTerm<T extends Term = Term>(original: T): T;

    fromQuad(original: Quad): Quad;
  }

  export interface DatasetCore extends Iterable<Quad> {
    readonly size: number;

    add(quad: Quad): SimpleDataset;

    delete(quad: Quad): SimpleDataset;

    has(quad: Quad): boolean;

    match(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): SimpleDataset;
  }

  export interface DatasetCoreFactory {
    dataset(quads?: Quad[]): DatasetCore;
  }

  export interface SimpleDataset extends DatasetCore {

    addAll(quads: SimpleDataset | Quad[]): SimpleDataset;

    equals(other: SimpleDataset): boolean;

    contains(other: SimpleDataset): boolean;

    union(quads: SimpleDataset): SimpleDataset;

    intersection(other: SimpleDataset): SimpleDataset;

    difference(other: SimpleDataset): SimpleDataset;
  }


  export interface Dataset extends SimpleDataset {

    deleteMatches(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): Dataset;

    every(iteratee: QuadFilterIteratee): boolean;

    filter(iteratee: QuadFilterIteratee): Dataset;

    forEach(iteratee: QuadRunIteratee): void;

    import(stream: Stream<Quad>): Promise<Dataset>;

    map(iteratee: QuadMapIteratee): Dataset;

    reduce(iteratee: QuadReduceIteratee, initialValue?: unknown): unknown;

    some(iteratee: QuadFilterIteratee): boolean;

    toCanonical(): string;

    toStream(): Stream<Quad>;

    toString(): string;


  }

  export interface DatasetFactory extends DataFactory {
    dataset(quads?: Dataset | Quad[]): Dataset
  }

  export interface QuadFilterIteratee {
    test(quad: Quad, dataset: Dataset): boolean;
  }

  export interface QuadMapIteratee {
    map(quad: Quad, dataset: Dataset): Quad
  }

  export interface QuadReduceIteratee {
    run(accumulator: unknown, quad: Quad, dataset: Dataset): unknown;
  }

  export interface QuadRunIteratee {
    run(quad: Quad, dataset: Dataset): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface EventEmitter {
    // unspecified
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Event {
    // unspecified
  }

  export interface Stream<T> extends EventEmitter {
    read(): T | null;

    readable: Rdfjs.Event;
    end: Rdfjs.Event
    error: Rdfjs.Event;
    data: Rdfjs.Event;
    prefix: Rdfjs.Event;
  }

  export interface ConstructorOptions {
    dataFactory?: DataFactory;
    baseIRI?: string;
  }

  export interface Source {
    match(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): Stream<Quad>;
  }

  export interface Sink<T> {
    import(stream: Stream<T>): EventEmitter;
  }

  export interface Store<T> extends Source, Sink<T> {
    remove(stream: Stream<Quad>): EventEmitter;

    removeMatches(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): EventEmitter;

    deleteGraph(graph: GraphTerm | string): EventEmitter;
  }
}
