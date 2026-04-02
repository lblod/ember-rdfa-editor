import { EditorState, NodeSelection } from '@lblod/ember-rdfa-editor';

export async function getContextualActions(state: EditorState) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    {
      id: 'dummy-action-1',
      label: 'Op het kruispunt van de … met de … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-2',
      label: 'Op alle wegen die uitkomen op … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-3',
      label: 'Op de … ter hoogte van … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-4',
      label: 'Op het kruispunt van de … met de … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-5',
      label: 'Op … vanaf … tot … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-5',
      label: 'Datum invoegen',
      group: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
  ].map((action) => {
    const node = state.schema.nodes['block_rdfa'].create(
      {
        rdfaNodeType: 'literal',
        label: `Plaatsbepaling`,
      },
      [
        state.schema.nodes['paragraph'].create(null, [
          state.schema.text(action.label),
        ]),
      ],
    );

    return {
      ...action,
      command: (state: EditorState, dispatch) => {
        if (dispatch) {
          const tr = state.tr;
          tr.replaceSelectionWith(node);
          if (tr.selection.$anchor.nodeBefore) {
            const resolvedPos = tr.doc.resolve(
              tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize,
            );
            tr.setSelection(new NodeSelection(resolvedPos));
          }
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
  ];
}
