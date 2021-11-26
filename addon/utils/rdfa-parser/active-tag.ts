/**
 * Modified from https://github.com/rubensworks/rdfa-streaming-parser.js
 *
 * Copyright © 2019 Ruben Taelman
 */
import {IRdfaPattern} from "./rdfa-pattern";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {
  ModelBlankNode,
  ModelNamedNode,
  ModelQuadPredicate, ModelTerm
} from "@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser";

/**
 * Data holder for the RDFa state in XML tags.
 */
export interface IActiveTag {
  name: string;
  prefixesAll: Record<string, string>;
  prefixesCustom: Record<string, string>;
  subject?: ModelNamedNode | ModelBlankNode | boolean;
  explicitNewSubject?: boolean;
  predicates?: ModelNamedNode[] | null;
  object?: ModelNamedNode | ModelBlankNode | boolean | null;
  text?: string[] | null;
  vocab?: string;
  language?: string;
  datatype?: ModelNamedNode;
  collectChildTags?: boolean;
  collectedPatternTag?: IRdfaPattern;
  interpretObjectAsTime?: boolean;
  incompleteTriples: { predicate: ModelQuadPredicate, reverse: boolean, list?: boolean }[];
  inlist: boolean;
  listMapping: Record<string, (ModelTerm | boolean)[]>;
  listMappingLocal: Record<string, (ModelTerm | boolean)[]>;
  skipElement: boolean;
  localBaseIRI?: ModelNamedNode;
  node?: ModelNode;
}
