import { EditorState } from '@lblod/ember-rdfa-editor';
import { type GetContextualActions } from '@lblod/ember-rdfa-editor/plugins/contextual-actions/index';

export function getContextualActions(state: EditorState) {
  return [
    {
      id: 'dummy-action-1',
      label: 'Op het kruispunt van de … met de … geldt',
      group: 'plaatsbepaling',
      command: () => false,
    },
    {
      id: 'dummy-action-2',
      label: 'Op alle wegen die uitkomen op … geldt',
      group: 'plaatsbepaling',
      command: () => false,
    },
    {
      id: 'dummy-action-3',
      label: 'Op de … ter hoogte van … geldt',
      group: 'plaatsbepaling',
      command: () => false,
    },
    {
      id: 'dummy-action-4',
      label: 'Op het kruispunt van de … met de … geldt',
      group: 'plaatsbepaling',
      command: () => false,
    },
    {
      id: 'dummy-action-5',
      label: 'Op … vanaf … tot … geldt',
      group: 'plaatsbepaling',
      command: () => false,
    },
  ];
}
