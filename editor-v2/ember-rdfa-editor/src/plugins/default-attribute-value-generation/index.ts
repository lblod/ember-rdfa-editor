import { changedDescendants } from '#root/utils/_private/changed-descendants';
import { isNone } from '#root/utils/_private/option';
import { Mark, MarkType, NodeType } from 'prosemirror-model';
import { NodeSelection, Plugin } from 'prosemirror-state';

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
              if (oldSelection instanceof NodeSelection) {
                tr.setSelection(NodeSelection.create(tr.doc, pos));
              }
            }
          }
        });
        return tr.steps.length ? tr : null;
      }
      return;
    },
  });
}
