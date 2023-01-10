import {
  EditorState,
  EditorStateConfig,
  PluginKey,
  Transaction,
} from 'prosemirror-state';
import {
  ProseStore,
  proseStoreFromParse,
} from '@lblod/ember-rdfa-editor/utils/datastore/prose-store';
import { PNode, ProsePlugin, Schema } from '@lblod/ember-rdfa-editor';
import { ProseReferenceManager } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { createLogger } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export const datastoreKey = new PluginKey<ProseStore>('datastore');

export { ProseStore } from '@lblod/ember-rdfa-editor/utils/datastore/prose-store';

export interface ElementPNode {
  node: PNode;
  from: number;
  to: number;
}

export type ResolvedPNode = ElementPNode;

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
          root: { node: state.doc, from: -1, to: state.doc.nodeSize },
          textContent,
          tag,
          children: children(state.schema, refman),
          attributes,
          isText,

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
            root: { node: newState.doc, from: -1, to: newState.doc.nodeSize },
            textContent,
            tag,
            children: children(newState.schema, refman),
            attributes,
            isText: isText,

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

function isText(resolvedNode: ResolvedPNode): boolean {
  return resolvedNode.node.isText || resolvedNode.node.isLeaf;
}

function children(schema: Schema, refman: ProseReferenceManager) {
  return function (resolvedNode: ResolvedPNode): Iterable<ResolvedPNode> {
    const { from, node } = resolvedNode;
    const children: ResolvedPNode[] = [];

    node.descendants((child, pos) => {
      const childPos = from + pos;
      children.push(
        refman.get({
          node: child,
          from: childPos,
          to: childPos + child.nodeSize,
        })
      );
      return false;
    });
    return children;
  };
}

function tag(resolvedNode: ResolvedPNode): string {
  return resolvedNode.node.type.name;
}

function attributes(resolvedNode: ResolvedPNode): Record<string, string> {
  return resolvedNode.node.attrs;
}
