import { changedDescendants } from '@lblod/ember-rdfa-editor/utils/_private/changed-descendants';
import { isNone } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { Mark, MarkType, NodeType } from 'prosemirror-model';
import { Plugin, Selection } from 'prosemirror-state';

export type DefaultAttrGenPuginOptions = {
  attribute: string;
  generator: () => unknown;
  types?: Set<NodeType | MarkType>;
}[];

export function defaultAttributeValueGeneration(
  options: DefaultAttrGenPuginOptions,
) {
  return new Plugin({
    appendTransaction(transactions, oldState, newState) {
      if (transactions.some((transaction) => transaction.docChanged)) {
        const tr = newState.tr;
        changedDescendants(oldState.doc, newState.doc, 0, (node, pos) => {
          let newAttrs = node.attrs;
          let newMarks = node.marks;
          options.forEach(({ attribute, generator, types }) => {
            if (!node.isText) {
              if (!types || types.has(node.type)) {
                if (attribute in newAttrs && isNone(newAttrs[attribute])) {
                  newAttrs = { ...newAttrs, [attribute]: generator() };
                }
              }
            }

            newMarks = newMarks.map((mark) => {
              if (!types || types.has(mark.type)) {
                if (attribute in mark.attrs && isNone(mark.attrs[attribute])) {
                  return mark.type.create({
                    ...mark.attrs,
                    [attribute]: generator(),
                  });
                }
              }
              return mark;
            });
          });
          if (node.isText && !Mark.sameSet(node.marks, newMarks)) {
            tr.removeMark(pos, pos + node.nodeSize, null);
            newMarks.forEach((mark) => {
              tr.addMark(pos, pos + node.nodeSize, mark);
            });
          } else {
            if (!node.hasMarkup(node.type, newAttrs, newMarks)) {
              const oldSelection = tr.selection;
              tr.setNodeMarkup(pos, null, newAttrs, newMarks);
              // A bit of a hack: we want to make sure to preserve the old selection, this allows us to easily copy it
              const newSelection = Selection.fromJSON(
                tr.doc,
                oldSelection.toJSON(),
              );
              tr.setSelection(newSelection);
            }
          }
        });
        return tr.steps.length ? tr : null;
      }
      return;
    },
  });
}
