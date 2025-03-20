/**
 * Modified from https://github.com/rubensworks/rdfa-streaming-parser.js
 *
 * Copyright © 2019 Ruben Taelman
 */
import type { IRdfaPattern } from './rdfa-pattern.ts';
import type {
  ModelBlankNode,
  ModelNamedNode,
  ModelQuadPredicate,
  ModelTerm,
} from '@lblod/ember-rdfa-editor/utils/_private/rdfa-parser/rdfa-parser.ts';

/**
 * Data holder for the RDFa state in XML tags.
 */
export interface IActiveTag<N> {
  name: string;
  prefixesAll: Record<string, string>;
  prefixesCustom: Record<string, string>;
  subject?: ModelNamedNode<N> | ModelBlankNode<N> | boolean;
  explicitNewSubject?: boolean;
  predicates?: ModelNamedNode<N>[] | null;
  object?: ModelNamedNode<N> | ModelBlankNode<N> | boolean | null;
  text?: string[] | null;
  vocab?: string;
  language?: string;
  datatype?: ModelNamedNode<N>;
  collectChildTags?: boolean;
  collectedPatternTag?: IRdfaPattern<N>;
  interpretObjectAsTime?: boolean;
  incompleteTriples: {
    predicate: ModelQuadPredicate<N>;
    reverse: boolean;
    list?: boolean;
  }[];
  inlist: boolean;
  listMapping: Record<string, (ModelTerm<N> | boolean)[]>;
  listMappingLocal: Record<string, (ModelTerm<N> | boolean)[]>;
  skipElement: boolean;
  localBaseIRI?: ModelNamedNode<N>;
  node?: N;
}
