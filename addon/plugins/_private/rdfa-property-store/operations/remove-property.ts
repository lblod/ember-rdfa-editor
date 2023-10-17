import { RdfaPropertyOperation, RdfaPropertyStore } from '..';

export class RemovePropertyOperation implements RdfaPropertyOperation {
  constructor(
    readonly subject: string,
    readonly index: number,
  ) {}
  apply(store: RdfaPropertyStore): RdfaPropertyStore {
    const newStore: RdfaPropertyStore = {
      resourceToProperties: new Map(store.resourceToProperties),
      resourceToBacklinks: new Map(store.resourceToBacklinks),
      nodeToBacklink: new Map(store.nodeToBacklink),
    };
    const { subject, index } = this;
    const currentProperties = newStore.resourceToProperties.get(subject);
    const propertyToRemove = currentProperties?.[index];
    if (!propertyToRemove) {
      throw new Error(
        `Cannot remove property at index ${index} from subject ${subject}`,
      );
    }
    const newProperties = currentProperties.slice();
    newProperties.splice(index, 1);
    if (newProperties.length === 0) {
      newStore.resourceToProperties.delete(subject);
    } else {
      newStore.resourceToProperties.set(subject, newProperties);
    }
    if (propertyToRemove.type === 'node') {
      //TODO: remove the inverse backlink
    }
    return newStore;
  }
}
