export type HtmlTag = keyof HTMLElementTagNameMap;

export interface Cloneable<T> {
  clone(): T;
}

export enum Direction {
  FORWARDS = 'forwards',
  BACKWARDS = 'backwards',
}

export enum RelativePosition {
  BEFORE,
  EQUAL,
  AFTER,
}

export enum PropertyState {
  enabled = 'enabled',
  disabled = 'disabled',
  unknown = 'unknown',
}

export type TextOrElement = Text | HTMLElement;

export function isTextOrElement(
  node: Node | null | undefined,
): node is TextOrElement {
  return (
    !!node &&
    (node.nodeType === Node.TEXT_NODE || node.nodeType === node.ELEMENT_NODE)
  );
}

export type ValuesOf<T> = T[keyof T];
