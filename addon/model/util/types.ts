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
