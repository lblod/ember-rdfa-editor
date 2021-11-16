import * as RDF from "@rdfjs/types";
import {IRdfaPattern} from "./IRdfaPattern";

/**
 * Data holder for the RDFa state in XML tags.
 */
export interface IActiveTag {
  name: string;
  prefixesAll: Record<string, string>;
  prefixesCustom: Record<string, string>;
  subject?: RDF.NamedNode | RDF.BlankNode | boolean;
  explicitNewSubject?: boolean;
  predicates?: RDF.NamedNode[] | null;
  object?: RDF.NamedNode | RDF.BlankNode | boolean | null;
  text?: string[] | null;
  vocab?: string;
  language?: string;
  datatype?: RDF.NamedNode;
  collectChildTags?: boolean;
  collectedPatternTag?: IRdfaPattern;
  interpretObjectAsTime?: boolean;
  incompleteTriples: { predicate: RDF.Quad_Predicate, reverse: boolean, list?: boolean }[];
  inlist: boolean;
  listMapping: Record<string, (RDF.Term | boolean)[]>;
  listMappingLocal: Record<string, (RDF.Term | boolean)[]>;
  skipElement: boolean;
  localBaseIRI?: RDF.NamedNode;
}
