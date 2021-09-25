import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {ModelNodeFinderFilter, ModelNodeFinderPredicate} from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import RdfaDocument from "@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document";

export type HtmlTag = keyof HTMLElementTagNameMap;

export interface Cloneable<T> {
  clone(): T;
}

export enum Direction {
  FORWARDS, BACKWARDS
}

export enum RelativePosition {
  BEFORE, EQUAL, AFTER
}

export enum PropertyState {
  enabled = 'enabled',
  disabled = 'disabled',
  unknown = 'unknown'
}

export interface FilterAndPredicate<T extends ModelNode> {
  filter?: ModelNodeFinderFilter<T>,
  predicate?: ModelNodeFinderPredicate<T>
}

export type RdfaEditorInitializer = (rdfaEditor: RdfaDocument) => void;
