export type Term = NamedNode | BlankNode | Literal | Variable | DefaultGraph | Quad;

export interface NamedNode {
  termType: "NamedNode";
  value: string;

  equals(other?: Term): boolean;
}

export interface BlankNode {
  termType: "BlankNode";
  value: string;

  equals(other?: Term): boolean;
}

export interface Literal {
  termType: "Literal";
  language: string;
  datatype: NamedNode;
  value: string;

  equals(other?: Term): boolean;
}

export interface Variable {
  termType: "Variable";
  value: string;

  equals(other?: Term): boolean;
}

export interface DefaultGraph {
  termType: "DefaultGraph";
  value: "";

  equals(other?: Term): boolean;
}

export type SubjectTerm = NamedNode | BlankNode | Variable | Quad;
export type PredicateTerm = NamedNode | Variable;
export type ObjectTerm = NamedNode | Literal | BlankNode | Variable;
export type GraphTerm = DefaultGraph | NamedNode | BlankNode | Variable;

export interface Quad {
  termType: "Quad";
  value: "";
  subject: SubjectTerm;
  predicate: PredicateTerm;
  object: ObjectTerm;
  graph: GraphTerm;

  equals(other?: Term): boolean;
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

  add(quad: Quad): Dataset;

  delete(quad: Quad): Dataset;

  has(quad: Quad): boolean;

  match(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): Dataset;
}

export interface DatasetCoreFactory {
  dataset(quads?: Quad[]): DatasetCore;
}


export interface Dataset extends DatasetCore {
  addAll(quads: Dataset | Quad[]): Dataset;

  equals(other: Dataset): boolean;

  contains(other: Dataset): boolean;

  union(quads: Dataset): Dataset;

  intersection(other: Dataset): Dataset;

  difference(other: Dataset): Dataset;

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
  dataset(this: void, quads?: Dataset | Quad[]): Dataset
}

export interface QuadFilterIteratee {
  test(this: void, quad: Quad, dataset: Dataset): boolean;
}

export interface QuadMapIteratee {
  map(this: void, quad: Quad, dataset: Dataset): Quad
}

export interface QuadReduceIteratee {
  run(this: void, accumulator: unknown, quad: Quad, dataset: Dataset): unknown;
}

export interface QuadRunIteratee {
  run(this: void, quad: Quad, dataset: Dataset): void;
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

  readable: Event;
  end: Event
  error: Event;
  data: Event;
  prefix: Event;
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
