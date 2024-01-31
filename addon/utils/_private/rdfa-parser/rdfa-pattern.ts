/**
 * Modified from https://github.com/rubensworks/rdfa-streaming-parser.js
 *
 * Copyright © 2019 Ruben Taelman
 */

import * as RDF from '@rdfjs/types';
import type { IActiveTag } from './active-tag';

/**
 * A datastructure for storing an rdfa:Pattern.
 */
export interface IRdfaPattern<N> {
  rootPattern: boolean;
  name: string;
  attributes: Record<string, string>;
  text: string[];
  children: IRdfaPattern<N>[];
  referenced: boolean;
  parentTag?: IActiveTag<N>;
  constructedBlankNodes?: RDF.BlankNode[];
}
