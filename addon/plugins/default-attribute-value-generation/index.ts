import { changedDescendants } from '@lblod/ember-rdfa-editor/utils/changed-descendants';
import { isNone } from '@lblod/ember-rdfa-editor/utils/option';
import { MarkType, NodeType } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

type PluginOptions = {
  attribute: string;
  generator: () => unknown;
  types?: Set<NodeType | MarkType>;
}[];

export function defaultAttributeValueGeneration(options: PluginOptions) {
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
                if (attribute in node.attrs && isNone(node.attrs[attribute])) {
                  newAttrs = { ...node.attrs, [attribute]: generator() };
                }
              }
            }

            newMarks = node.marks.map((mark) => {
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
          if (node.isText) {
            tr.replaceWith(
              pos,
              pos + node.nodeSize,
              newState.schema.text(node.textContent, newMarks)
            );
          } else {
            tr.setNodeMarkup(pos, null, newAttrs, newMarks);
          }
        });
        return tr.steps.length ? tr : null;
      }
      return;
    },
  });
}
