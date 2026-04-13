import {
  EditorState,
  TextSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { v4 as uuidv4 } from 'uuid';

export async function getContextualActions() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    {
      label: 'Op het kruispunt van de … met de … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Op alle wegen die uitkomen op … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Op de … ter hoogte van … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Op het kruispunt van de … met de … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Op … vanaf … tot … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Datum invoegen',
      group: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      insert: '11/02/2027',
    },
    {
      label: 'Locatie invoegen',
      group: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      description: 'Voeg een locatie in',
    },
    {
      label: 'Marcode invoegen',
      group: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      insert: 'MAR12',
      description: 'Voeg een marcode in',
    },
    {
      label: 'Pelikaanstraat',
      group: 'locations-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Tarbotstraat',
      group: 'locations-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Tolhuiskaai',
      group: 'locations-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Veldstraat',
      group: 'locations-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Op … vanaf … tot … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      label: 'Markt 17, 9230 Wetteren',
      group: 'street-suggestions-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      priority: 2,
    },
    {
      label: 'Perceel 44A, 9000 Aalst',
      group: 'street-suggestions-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      priority: 9,
    },
  ].map((action) => {
    return {
      ...action,
      id: uuidv4(),
      command: (
        state: EditorState,
        dispatch?: (transaction: Transaction) => void,
      ) => {
        if (dispatch) {
          const tr = state.tr;
          tr.replaceSelectionWith(
            state.schema.text(action.insert ?? action.label),
          );
          tr.setSelection(
            new TextSelection(tr.selection.$from, tr.selection.$from),
          );
          dispatch(tr);
        }
        return true;
      },
    };
  });
}

export function getContextualGroups() {
  return [
    {
      id: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      label: 'Plaatsbepaling',
    },
    {
      id: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      label: 'Invoegen',
    },
    {
      id: 'locations-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      label: 'Straten in Gent',
      priority: 9,
    },
    {
      id: 'street-suggestions-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      label: 'Plaats suggesties',
      priority: 10,
    },
  ];
}
