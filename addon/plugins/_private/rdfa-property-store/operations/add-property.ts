import { OutgoingProp } from '@lblod/ember-rdfa-editor/core/say-parser';
import { RdfaPropertyOperation, RdfaPropertyStore } from '..';

export class AddPropertyOperation implements RdfaPropertyOperation {
  constructor(
    readonly subject: string,
    readonly property: OutgoingProp,
  ) {}
  apply(store: RdfaPropertyStore): RdfaPropertyStore {
    const newStore: RdfaPropertyStore = {
      resourceToProperties: new Map(store.resourceToProperties),
      resourceToBacklinks: new Map(store.resourceToBacklinks),
      nodeToBacklink: new Map(store.nodeToBacklink),
    };
    const { subject, property } = this;
    const currentProperties = newStore.resourceToProperties.get(subject) || [];
    const newProperties = [...currentProperties, property];
    newStore.resourceToProperties.set(subject, newProperties);
    if (property.type === 'node') {
      //TODO: add the inverse backlink
    }
    return newStore;
  }
}
