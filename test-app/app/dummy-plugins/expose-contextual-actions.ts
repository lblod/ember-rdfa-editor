import {
  EditorState,
  NodeSelection,
  TextSelection,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import type { ContextualActionGroup } from '@lblod/ember-rdfa-editor/plugins/contextual-actions';
import { v4 as uuidv4 } from 'uuid';

const plaatsbepalingActions = [
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
    label:
      'Dit is een hele lange actie, die doet het menu waarschijnlijk overflowen, wat moet er dan gebeuren?',
    description:
      'Dit is een hele lange actie, die doet het menu waarschijnlijk overflowen, wat moet er dan gebeuren?',
    group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
  },
  {
    label: 'Op … vanaf … tot … geldt',
    group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
  },
];

const insertActions = [
  {
    label: 'Datum invoegen',
    group: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    insert: '11/02/2027',
    icon: 'calendar',
  },
  {
    label: 'Locatie invoegen',
    group: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    description: 'Voeg een locatie in',
    icon: 'location',
  },
  {
    label: 'Gebied invoegen',
    group: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    description: 'Voeg een gebied in',
    icon: 'area',
  },
  {
    label: 'Marcode invoegen',
    group: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    insert: 'MAR12',
    description: 'Voeg een marcode in',
  },
];

const locationActions = [
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
];

const streetSuggestionActions = [
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
];

function buildGetActions(
  actionLabels: {
    label: string;
    group: string;
    priority?: number;
    icon?: string;
    description?: string;
    insert?: string;
  }[],
  loadingTimeMs = 0,
  ignoreSearch = false,
) {
  return async function (_state: EditorState, searchQuery?: string) {
    if (loadingTimeMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, loadingTimeMs));
    }
    return actionLabels
      .filter(
        ({ label }) =>
          ignoreSearch ||
          !searchQuery ||
          label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .map((action) => {
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
  };
}
export function getContextualGroups(state: EditorState, searchQuery?: string) {
  const groups: ContextualActionGroup[] = [
    {
      id: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      label: 'Plaatsbepaling',
      getActions: buildGetActions(plaatsbepalingActions, 2000),
      searchDebounceMs: 200,
    },
    {
      id: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      sticky: 'bottom',
      getActions: buildGetActions(insertActions, 0, true),
    },
    {
      id: 'street-suggestions-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      label: 'Plaats suggesties',
      priority: 10,
      getActions: buildGetActions(streetSuggestionActions),
    },
  ];
  if (searchQuery) {
    groups.push({
      id: 'locations-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      label: 'Straten in Gent',
      loadingMessage: 'Straten aan het ophalen',
      searchDebounceMs: 500,
      priority: 9,
      getActions: buildGetActions(locationActions, 1000),
    });
  }
  if (
    state.selection instanceof NodeSelection &&
    state.selection.node.attrs['placeholderText']
  )
    return groups.slice(0, 1);
  return groups;
}
