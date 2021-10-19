import {
  BlankNode,
  Dataset,
  DatasetFactory,
  DefaultGraph,
  GraphTerm,
  Literal,
  NamedNode,
  ObjectTerm,
  PredicateTerm,
  Quad,
  QuadFilterIteratee,
  QuadMapIteratee,
  QuadReduceIteratee,
  QuadRunIteratee,
  Stream,
  SubjectTerm,
  Term,
  Variable
} from "rdfjs";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import dataset, {FastDataset} from "@graphy/memory.dataset.fast";

const STRING_DATAYPE_IRI = "http://www.w3.org/2001/XMLSchema#string";
const LANG_STRING_IRI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

export abstract class RdfTerm {
  abstract termType: string;
  value: string;

  protected constructor(value: string) {
    this.value = value;
  }

  equals(other?: Term): boolean {
    if (other) {
      if (other.termType === this.termType) {
        return true;
      }
    }
    return false;
  }

}

export class RdfNamedNode extends RdfTerm implements NamedNode {
  termType: "NamedNode" = "NamedNode";

  constructor(value: string) {
    super(value);
  }

  equals(other?: Term): boolean {
    return super.equals(other) && this.value === other?.value;
  }

}

export class RdfBlankNode extends RdfTerm implements BlankNode {
  termType: "BlankNode" = "BlankNode";

  constructor(value: string) {
    super(value);
  }

  equals(other?: Term): boolean {
    return super.equals(other) && this.value === other?.value;
  }
}

export class RdfLiteral extends RdfTerm implements Literal {
  termType: "Literal" = "Literal";
  language: string;
  datatype: NamedNode;

  constructor(value: string, languageOrDataType?: string | NamedNode) {
    super(value);
    if (!languageOrDataType) {
      this.datatype = new RdfNamedNode(STRING_DATAYPE_IRI);
      this.language = "";
    } else if (typeof languageOrDataType === "string") {
      this.language = languageOrDataType;
      this.datatype = new RdfNamedNode(LANG_STRING_IRI);
    } else {
      this.datatype = languageOrDataType;
      this.language = "";
    }
  }

  equals(other?: Term): boolean {
    if (super.equals(other)) {
      return this.language === (other as Literal).language
        && this.datatype.equals((other as Literal).datatype);
    }
    return false;
  }
}


export class RdfVariable extends RdfTerm implements Variable {
  termType: "Variable" = "Variable";

  constructor(value: string) {
    super(value);
  }

  equals(other?: Term): boolean {
    return super.equals(other) && this.value === other?.value;
  }

}

export class RdfQuad extends RdfTerm implements Quad {
  termType: "Quad" = "Quad";
  subject: SubjectTerm;
  predicate: PredicateTerm;
  object: ObjectTerm;
  graph: GraphTerm;
  value: "";

  constructor(subject: SubjectTerm, predicate: PredicateTerm, object: ObjectTerm, graph: GraphTerm = new RdfDefaultGraph()) {
    super("");
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
    this.graph = graph;
    this.value = "";
  }

  equals(other?: Term): boolean {
    if (other && other.termType === "Quad") {
      return this.subject.equals(other.subject)
        && this.predicate.equals(other.predicate)
        && this.object.equals(other.object)
        && this.graph.equals(other.graph);

    } else {
      return false;
    }
  }

}

export class RdfDefaultGraph extends RdfTerm implements DefaultGraph {
  termType: "DefaultGraph" = "DefaultGraph";
  value: "";

  constructor() {
    super("");
    this.value = "";
  }

  equals(other?: Term): boolean {
    return super.equals(other);
  }
}

function isFastDataset(thing: unknown): thing is FastDataset {
  // ts fails us here, see https://github.com/Microsoft/TypeScript/issues/21732
  if ("isGraphyFastDataset" in (thing as Record<string, unknown>)) {
    return (thing as FastDataset).isGraphyFastDataset;
  }
  return false;
}

export default class Datastore implements Dataset, DatasetFactory {
  private _fastDataset: FastDataset;

  constructor(quads?: Dataset | Quad[] | FastDataset) {
    if (isFastDataset(quads)) {
      this._fastDataset = quads;
    }
    this._fastDataset = dataset(quads);
  }

  get size() {
    return this._fastDataset.size;
  }

  get fastDataset(): FastDataset {
    return this._fastDataset;
  }

  fromFastDataset(fastDataset: FastDataset): Datastore {
    return new Datastore(fastDataset);
  }

  dataset(quads?: Dataset | Quad[] | FastDataset): Datastore {
    return new Datastore(quads);
  }

  [Symbol.iterator](): Iterator<Quad> {
    return this._fastDataset[Symbol.iterator]();
  }

  get [Symbol("key-count")]() {
    return this._fastDataset.size;
  }

  add(quad: Quad): Datastore {
    this._fastDataset.add(quad);
    return this;
  }

  addAll(quads: Dataset | Quad[]): Datastore {
    this._fastDataset.addAll(quads);
    return this;
  }

  blankNode(value?: string): BlankNode {
    return new RdfBlankNode(value || "");
  }

  contains(other: Datastore): boolean {
    return this._fastDataset.intersection(other.fastDataset).size === other.size;
  }


  defaultGraph(): DefaultGraph {
    return new RdfDefaultGraph();
  }

  delete(quad: Quad): Datastore {
    this._fastDataset.delete(quad);
    return this;
  }

  deleteMatches(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): Dataset {
    throw new NotImplementedError();
  }

  difference(other: Dataset): Dataset {
    return this.fromFastDataset(this._fastDataset.difference(other));
  }

  equals(other: Dataset): boolean {
    return this._fastDataset.equals(other);
  }

  every(iteratee: QuadFilterIteratee | ((quad: Quad, dataset: Dataset) => boolean)): boolean {
    let test;
    if (iteratee instanceof Function) {
      test = iteratee;
    } else {
      test = iteratee.test;
    }
    for (const quad of this) {
      if (!test(quad, this)) {
        return false;
      }
    }
    return true;
  }

  filter(iteratee: QuadFilterIteratee | ((quad: Quad, dataset: Dataset) => boolean)): Datastore {
    let filter;
    if (typeof iteratee === "function") {
      filter = iteratee;
    } else {
      filter = iteratee.test;
    }
    const rslt = [];
    for (const quad of this) {
      if (filter(quad, this)) {
        rslt.push(quad);
      }
    }
    return new Datastore(rslt);
  }

  forEach(iteratee: QuadRunIteratee | ((quad: Quad, dataset: Dataset) => void)): void {
    let run;
    if (typeof iteratee === "function") {
      run = iteratee;
    } else {
      run = iteratee.run;
    }
    for (const quad of this) {
      run(quad, this);
    }
  }

  fromQuad(original: Quad): Quad {
    throw new NotImplementedError();
  }

  fromTerm<T extends Term>(original: T): T {
    throw new NotImplementedError();
  }

  has(quad: Quad): boolean {
    return this._fastDataset.has(quad);
  }

  import(stream: Stream<Quad>): Promise<Dataset> {
    throw new NotImplementedError();
  }

  intersection(other: Datastore): Datastore {
    return this.fromFastDataset(this._fastDataset.intersection(other.fastDataset));
  }

  literal(value: string, languageOrDatatype ?: string | NamedNode): Literal {
    return new RdfLiteral(value, languageOrDatatype);
  }

  map(iteratee: QuadMapIteratee | ((quad: Quad, dataset: Dataset) => Quad)): Dataset {
    let map;
    if (typeof iteratee === "function") {
      map = iteratee;
    } else {
      map = iteratee.map;
    }
    const result = [];
    for (const quad of this) {
      result.push(map(quad, this));
    }
    return new Datastore(result);
  }

  match(subject ?: SubjectTerm, predicate ?: PredicateTerm, object ?: ObjectTerm, graph ?: GraphTerm): Dataset {
    return this.fromFastDataset(this._fastDataset.match(subject, predicate, object, graph));
  }

  namedNode(value: string): NamedNode {
    return new RdfNamedNode(value);
  }

  quad(subject: SubjectTerm, predicate: PredicateTerm, object: ObjectTerm, graph ?: GraphTerm): Quad {
    return new RdfQuad(subject, predicate, object, graph);
  }

  reduce(iteratee: QuadReduceIteratee | ((accumulator: unknown, quad: Quad, dataset: Datastore) => unknown), initialValue ?: unknown): unknown {
    let reduce;
    if (typeof iteratee === "function") {
      reduce = iteratee;
    } else {
      reduce = iteratee.run;
    }
    const quads = [...this];
    let accumulator = initialValue ?? quads[0];

    for (const quad of quads) {
      accumulator = reduce(accumulator, quad, this);
    }
    return accumulator;
  }

  some(iteratee: QuadFilterIteratee | ((quad: Quad, dataset: Dataset) => boolean)): boolean {
    let test;
    if (iteratee instanceof Function) {
      test = iteratee;
    } else {
      test = iteratee.test;
    }
    for (const quad of this) {
      if (test(quad, this)) {
        return true;
      }
    }
    return false;
  }

  toCanonical(): string {
    throw new NotImplementedError();
  }

  toStream(): Stream<Quad> {
    throw new NotImplementedError();
  }

  union(quads: Dataset): Dataset {
    return this.fromFastDataset(this._fastDataset.union(quads));
  }

  variable(value: string): Variable {
    return new RdfVariable(value);
  }
}
