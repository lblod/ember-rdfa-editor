import { type Fragment } from 'prosemirror-model';
import { type PNode } from '#root/prosemirror-aliases.ts';
import { htmlSafe } from '@ember/template';

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

export type ValueOf<T> = T[keyof T];

export type ResolvedPNode = {
  value: PNode;
  pos: number;
};

export type Promisable<T> = T | PromiseLike<T>;

export type SafeString = ReturnType<typeof htmlSafe>;

export type AllOrNone<T> = T | { [K in keyof T]?: never };

export type ContentSpec = Fragment | PNode | PNode[];
