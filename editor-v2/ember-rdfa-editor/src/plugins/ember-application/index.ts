import { PluginKey } from 'prosemirror-state';
import { ProsePlugin } from '#root';
import type Owner from '@ember/owner';

export const emberApplicationPluginKey = new PluginKey<DatastorePluginState>(
  'ember_application',
);

export interface DatastorePluginArgs {
  application: Owner;
}

export interface DatastorePluginState {
  application: Owner;
}

/** This plugin gives access to the ember application instance, so this can be used in other plugins/nodes. You can initialize it with `emberApplication({ application: getOwner(this) })`. Afterwards, you can access the ember application and do things like accessing ember services anywhere you have access to the state.
```
import { emberApplicationPluginKey } from '#root/plugins/ember-application';
const intlService = emberApplicationPluginKey.getState(state)?.application.lookup('service:intl');
```
*/
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
