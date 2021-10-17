export interface AttributeContainer<K, V> {
  get attributeMap(): Map<K, V>

  getAttribute(key: K): V | undefined;

  setAttribute(key: K, value: V): void;

  removeAttribute(key: K): boolean;

}
