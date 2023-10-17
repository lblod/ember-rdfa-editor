import { PluginKey, ProsePlugin, Transaction } from '@lblod/ember-rdfa-editor';
import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';

export interface RdfaPropertyOperation {
  apply(store: RdfaPropertyStore): RdfaPropertyStore;
}

export const rdfaPropertyStoreKey = new PluginKey<RdfaPropertyStore>(
  'rdfa-property-store',
);

export type RdfaPropertyStoreArgs = {
  rootNode: HTMLElement;
};

export type RdfaPropertyStore = {
  resourceToProperties: Map<string, OutgoingProp[]>;
  resourceToBacklinks: Map<string, IncomingProp[]>;
  nodeToBacklink: Map<string, IncomingProp>;
};

export function rdfaPropertyStore(
  _args: RdfaPropertyStoreArgs,
): ProsePlugin<RdfaPropertyStore> {
  return new ProsePlugin<RdfaPropertyStore>({
    key: rdfaPropertyStoreKey,
    state: {
      init(): RdfaPropertyStore {
        throw new NotImplementedError(
          'TODO: initialize rdfa-property store based on provided html document',
        );
        return {
          resourceToProperties: new Map(),
          resourceToBacklinks: new Map(),
          nodeToBacklink: new Map(),
        };
      },
      apply(tr: Transaction, oldStore: RdfaPropertyStore) {
        //TODO: also update the store if nodes with properties/backlinks get removed
        const operation = tr.getMeta(rdfaPropertyStoreKey) as
          | RdfaPropertyOperation
          | undefined;
        return operation ? operation.apply(oldStore) : oldStore;
      },
    },
  });
}
