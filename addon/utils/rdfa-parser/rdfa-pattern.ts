/**
 * Modified from https://github.com/rubensworks/rdfa-streaming-parser.js
 *
 * Copyright © 2019 Ruben Taelman
 */

import * as RDF from '@rdfjs/types';
import { IActiveTag } from './active-tag';

/**
 * A datastructure for storing an rdfa:Pattern.
 */
export interface IRdfaPattern {
  rootPattern: boolean;
  name: string;
  attributes: Record<string, string>;
  text: string[];
  children: IRdfaPattern[];
  referenced: boolean;
  parentTag?: IActiveTag;
  constructedBlankNodes?: RDF.BlankNode[];
}
