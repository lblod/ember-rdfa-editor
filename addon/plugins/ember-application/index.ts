import { PluginKey } from 'prosemirror-state';
import { ProsePlugin } from '@lblod/ember-rdfa-editor';
import Owner from '@ember/owner';

export const emberApplicationPluginKey = new PluginKey<DatastorePluginState>(
  'ember_application'
);

export interface DatastorePluginArgs {
  application: Owner;
}

export interface DatastorePluginState {
  application: Owner;
}

export function emberApplication({
  application,
}: DatastorePluginArgs): ProsePlugin<DatastorePluginState> {
  return new ProsePlugin<DatastorePluginState>({
    key: emberApplicationPluginKey,
    state: {
      init(): DatastorePluginState {
        return { application };
      },
      apply() {
        return { application };
      },
    },
  });
}
