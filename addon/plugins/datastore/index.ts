import {
  EditorState,
  EditorStateConfig,
  PluginKey,
  Transaction,
} from 'prosemirror-state';
import {
  ProseStore,
  proseStoreFromParse,
  ResolvedPNode,
} from '@lblod/ember-rdfa-editor/utils/datastore/prose-store';
import { PNode, ProsePlugin } from '@lblod/ember-rdfa-editor';
import { Mark, MarkType, Schema } from 'prosemirror-model';
import { filter, objectValues } from 'iter-tools';
import { ProseReferenceManager } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { createLogger } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export const datastoreKey = new PluginKey<ProseStore>('datastore');

export interface DatastorePluginArgs {
  pathFromRoot: Node[];
  baseIRI: string;
}

export function datastore({
  pathFromRoot,
  baseIRI,
}: DatastorePluginArgs): ProsePlugin<ProseStore> {
  const logger = createLogger('datastore');
  return new ProsePlugin({
    key: datastoreKey,
    state: {
      init(config: EditorStateConfig, state: EditorState) {
        const refman = new ProseReferenceManager();
        const store = proseStoreFromParse({
          root: { node: state.doc, pos: -1 },
          textContent,
          tag: tag(state.schema),
          children: children(state.schema, refman),
          attributes: attributes(state.schema),
          isText: isText(state.schema),
          getParent: getParent(refman),

          pathFromDomRoot: pathFromRoot,
          baseIRI,
        });

        logger(`parsed ${store.size} triples`);
        return store;
      },
      apply(
        tr: Transaction,
        oldStore: ProseStore,
        oldState: EditorState,
        newState: EditorState
      ) {
        const refman = new ProseReferenceManager();
        if (tr.docChanged) {
          const newStore = proseStoreFromParse({
            root: { node: newState.doc, pos: -1 },
            textContent,
            tag: tag(newState.schema),
            children: children(newState.schema, refman),
            attributes: attributes(newState.schema),
            isText: isText(newState.schema),
            getParent: getParent(refman),

            pathFromDomRoot: pathFromRoot,
            baseIRI,
          });
          logger(`parsed ${newStore.size} triples`);
          return newStore;
        } else {
          return oldStore;
        }
      },
    },
  });
}

function textContent(resolvedNode: ResolvedPNode): string {
  return resolvedNode.node.textContent;
}

function isText(schema: Schema) {
  return function (resolvedNode: ResolvedPNode): boolean {
    const { node } = resolvedNode;
    if (getLinkMark(schema, node)) {
      return false;
    }
    return node.isText;
  };
}

function getLinkMark(schema: Schema, node: PNode): Mark | undefined {
  if (!schema.marks.link) {
    return undefined;
  }
  const linkMarks = filter(
    (markType: MarkType) => markType.spec.group === 'linkmarks',
    objectValues(schema.marks)
  );
  const isText = node.isText;
  if (isText) {
    for (const type of linkMarks) {
      const mark = type.isInSet(node.marks);
      if (mark) {
        return mark;
      }
    }
  }
  return undefined;
}

function children(schema: Schema, refman: ProseReferenceManager) {
  return function (resolvedNode: ResolvedPNode): Iterable<ResolvedPNode> {
    let result: Iterable<ResolvedPNode>;
    const { node, pos } = resolvedNode;
    if (node.isText) {
      const linkMark = getLinkMark(schema, node);
      if (linkMark) {
        result = [
          refman.get({
            node: node.mark(linkMark.removeFromSet(node.marks)),
            pos,
          }),
        ];
      } else {
        result = [];
      }
    } else {
      const rslt: ResolvedPNode[] = [];
      node.descendants((child, relativePos) => {
        const absolutePos = pos + 1 + relativePos;
        rslt.push(
          refman.get({
            node: child,
            pos: absolutePos,
          })
        );
        return false;
      });
      result = rslt;
    }
    return result;
  };
}

function tag(schema: Schema) {
  return function (resolvedNode: ResolvedPNode): string {
    const { node } = resolvedNode;
    if (getLinkMark(schema, node)) {
      return 'a';
    }
    return node.type.name;
  };
}

function attributes(schema: Schema) {
  return function (resolvedNode: ResolvedPNode): Record<string, string> {
    const { node } = resolvedNode;
    const linkMark = getLinkMark(schema, node);
    if (linkMark) {
      return linkMark.attrs;
    }
    return node.attrs;
  };
}

function getParent(refman: ProseReferenceManager) {
  return function (
    resolvedNode: ResolvedPNode,
    resolvedRoot: ResolvedPNode
  ): ResolvedPNode | null {
    let result: ResolvedPNode | null;
    const { pos } = resolvedNode;
    if (pos === -1) {
      result = null;
    } else {
      const resolvedPos = resolvedRoot.node.resolve(pos);
      if (resolvedPos.depth === 0) {
        result = refman.get({
          node: resolvedPos.parent,
          pos: -1,
        });
      } else {
        result = refman.get({
          node: resolvedPos.parent,
          pos: resolvedPos.before(),
        });
      }
    }
    return result;
  };
}
