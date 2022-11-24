import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export default function placeholder(): Plugin {
  const placeholder: Plugin<DecorationSet> = new Plugin<DecorationSet>({
    state: {
      init(_, state: EditorState) {
        const { doc } = state;
        const speckles = [];
        for (let pos = 1; pos < doc.content.size; pos += 4) {
          speckles.push(
            Decoration.inline(pos - 1, pos, { style: 'background: yellow' })
          );
        }
        return DecorationSet.create(doc, speckles);
      },
      apply(tr: Transaction, set: DecorationSet) {
        let newSet = set;
        const newDecs: Decoration[] = [];
        tr.mapping.maps.forEach((map) =>
          map.forEach((oldStart, oldEnd, newStart, newEnd) => {
            const oldDecs = set.find(oldStart, oldEnd);
            newSet = newSet.remove(oldDecs);
            for (let pos = newStart; pos < newEnd; pos += 4) {
              if (pos % 4 === 0) {
                newDecs.push(
                  Decoration.inline(pos - 1, pos, {
                    style: 'background: yellow',
                  })
                );
              }
            }
          })
        );
        newSet = newSet.add(tr.doc, newDecs);
        return newSet.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations(state: EditorState) {
        return placeholder.getState(state);
      },
    },
  });
  // props: {
  //   decorations: (state) => {
  //     const decorations: Decoration[] = [];
  //
  //     const decorate = (node: PNode, pos: number) => {
  //       if (
  //         node.type.isBlock &&
  //         node.childCount === 0 &&
  //         state.selection.$anchor.parent !== node
  //       ) {
  //         decorations.push(
  //           Decoration.node(pos, pos + node.nodeSize, {
  //             class: 'empty-node',
  //           })
  //         );
  //       }
  //     };
  //
  //     state.doc.descendants(decorate);
  //
  //     return DecorationSet.create(state.doc, decorations);
  //   },
  // },
  return placeholder;
}
