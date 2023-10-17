import { RdfaPropertyOperation, RdfaPropertyStore } from '..';

export class ClearPropertiesOperation implements RdfaPropertyOperation {
  constructor(readonly subject: string) {}
  apply(store: RdfaPropertyStore): RdfaPropertyStore {
    const newStore: RdfaPropertyStore = {
      resourceToProperties: new Map(store.resourceToProperties),
      resourceToBacklinks: new Map(store.resourceToBacklinks),
      nodeToBacklink: new Map(store.nodeToBacklink),
    };
    const { subject } = this;
    const currentProperties = newStore.resourceToProperties.get(subject) || [];
    newStore.resourceToProperties.delete(subject);
    currentProperties.forEach((property) => {
      if (property.type === 'node') {
        //TODO: remove the inverse backlink
      }
    });
    return newStore;
  }
}
