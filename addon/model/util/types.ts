export type HtmlTag = keyof HTMLElementTagNameMap;

export interface Cloneable<T> {
  clone(): T;
}
