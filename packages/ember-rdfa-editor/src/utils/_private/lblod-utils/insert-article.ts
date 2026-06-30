import { EditorState, TextSelection, Transaction } from 'prosemirror-state';
import { PNode } from '#root/prosemirror-aliases.ts';
import { ELI, PROV } from '#root/utils/_private/lblod-utils/constants.ts';
import { getOutgoingTriple } from '#root/utils/namespace.ts';
import {
  transactionCombinator,
  type TransactionMonad,
} from '#root/utils/transaction-utils.ts';
import { addPropertyToNode, findNodeByRdfaId } from '#root/utils/rdfa-utils.ts';
import { SayDataFactory } from '#root/core/say-data-factory/index.ts';
import { getNodesBySubject } from '#root/plugins/rdfa-info/index.ts';
import { recalculateNumbers } from '#root/utils/_private/lblod-utils/recalculate-structure-numbers.ts';

export interface InsertArticleToDecisionArgs {
  node: PNode;
  decisionUri: string;
  insertFreely?: false;
  /*
   * The position index of the node within the container
   * - If `position` is undefined, insert at the end of the container.
   * - If `position` is 0, insert before the first child.
   * - If `position` >= childCount, insert after the last child (append).
   * - Otherwise, insert before the child at that index.
   */
  position?: number;
}
export interface InsertArticleFreelyArgs {
  node: PNode;
  insertFreely: true;
  decisionUri?: string;
}

export function insertArticle(
  args: InsertArticleToDecisionArgs | InsertArticleFreelyArgs,
): TransactionMonad<boolean> {
  return function (state: EditorState) {
    const { decisionUri, node } = args;
    const tr = state.tr;
    let replacementTr: Transaction;
    let insertLocation: number | undefined;
    if ('insertFreely' in args && args.insertFreely) {
      replacementTr = tr.replaceSelectionWith(node);
    } else {
      const { position } = args;
      const decision = getNodesBySubject(state, args.decisionUri)[0];
      if (!decision) {
        return {
          initialState: state,
          transaction: state.tr,
          result: false,
        };
      }
      const container = getOutgoingTriple(decision.value.attrs, PROV('value'));
      if (!container) {
        return {
          initialState: state,
          transaction: state.tr,
          result: false,
        };
      }
      const location = findNodeByRdfaId(state.doc, container.object.value);
      if (!location) {
        return {
          initialState: state,
          transaction: state.tr,
          result: false,
        };
      }
      insertLocation = resolveInsertLocation(location, position);
      replacementTr = tr.replaceWith(insertLocation, insertLocation, node);
    }

    const factory = new SayDataFactory();
    const { result, transaction } = transactionCombinator(
      state,
      replacementTr,
    )([
      ...(decisionUri
        ? [
            addPropertyToNode({
              resource: decisionUri,
              property: {
                predicate: ELI('has_part').full,
                object: factory.resourceNode(node.attrs['subject'] as string),
              },
            }),
          ]
        : []),
      recalculateNumbers,
    ]);

    if (insertLocation) {
      transaction.setSelection(
        TextSelection.create(
          transaction.doc,
          insertLocation + 1,
          insertLocation + node.nodeSize - 1,
        ),
      );
    }

    transaction.scrollIntoView();
    return {
      initialState: state,
      transaction,
      result: result.every((ok) => ok),
    };
  };
}

/**
 * Resolves the document position at which to insert a new article node
 */
function resolveInsertLocation(
  containerLocation: { pos: number; value: PNode },
  position: number | undefined,
): number {
  const containerNode = containerLocation.value;

  if (position === undefined) {
    return containerLocation.pos + containerNode.nodeSize - 1;
  }

  const childCount = containerNode.childCount;

  if (position >= childCount) {
    return containerLocation.pos + containerNode.nodeSize - 1;
  }

  let offset = containerLocation.pos + 1; // +1 to step inside the container node
  let articleIndex = 0;
  for (const child of containerNode.children) {
    if (articleIndex === position) {
      return offset;
    }
    offset += child.nodeSize;
    if (child.attrs['structureType'] === 'article') {
      articleIndex += 1;
    }
  }

  return containerLocation.pos + containerNode.nodeSize - 1;
}
