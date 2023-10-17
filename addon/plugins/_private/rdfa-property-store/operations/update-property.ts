import { OutgoingProp } from '@lblod/ember-rdfa-editor/core/say-parser';
import { RdfaPropertyOperation, RdfaPropertyStore } from '..';

export class UpdatePropertyOperation implements RdfaPropertyOperation {
  constructor(
    readonly subject: string,
    readonly index: number,
    readonly newProperty: OutgoingProp,
  ) {}
  apply(store: RdfaPropertyStore): RdfaPropertyStore {
    const newStore: RdfaPropertyStore = {
      resourceToProperties: new Map(store.resourceToProperties),
      resourceToBacklinks: new Map(store.resourceToBacklinks),
      nodeToBacklink: new Map(store.nodeToBacklink),
    };
    const { subject, index, newProperty } = this;
    const currentProperties = newStore.resourceToProperties.get(subject);
    const oldProperty = currentProperties?.[index];
    if (!oldProperty || oldProperty.type !== newProperty.type) {
      throw new Error(
        `Cannot update property at index ${index} from subject ${subject}`,
      );
    }
    const newProperties = currentProperties.slice();
    newProperties[index] = newProperty;
    newStore.resourceToProperties.set(subject, newProperties);
    if (oldProperty.type === 'node') {
      //TODO: update/replace the inverse backlinks
    }
    return newStore;
  }
}
