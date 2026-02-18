import {
  EditorState,
  type EditorStateConfig,
  PluginKey,
  Transaction,
} from 'prosemirror-state';
import {
  proseStoreFromParse,
  SayStore,
} from '#root/utils/_private/datastore/say-store.ts';
import { map, objectFrom } from 'iter-tools';
import { ProseReferenceManager } from './prose-reference-manager.ts';
import {
  createLogger,
  type Logger,
} from '#root/utils/_private/logging-utils.ts';
import { DOMSerializer, MarkType } from 'prosemirror-model';
import { isElement, tagName } from '#root/utils/_private/dom-helpers.ts';
import { type Option, unwrap } from '#root/utils/_private/option.ts';
import ArrayUtils from '#root/utils/_private/array-utils.ts';
import type { Mark } from 'prosemirror-model';
import { ProsePlugin, type PNode } from '#root/prosemirror-aliases.ts';
import type { Schema } from 'prosemirror-model';
import type { DatastoreResolvedPNode, TextPNode } from './datastore-node-types';
import { isElementPNode } from './datastore-node-types.ts';

export const datastoreKey = new PluginKey<DatastorePluginState>('datastore');
export {
  type DatastoreResolvedPNode,
  type ElementPNode,
  type TextPNode,
  isElementPNode,
} from './datastore-node-types.ts';
export { SayStore } from '#root/utils/_private/datastore/say-store.ts';

export function getAppliedMarks(pnode: DatastoreResolvedPNode): Mark[] {
  const marks = [];
  let currentNode: DatastoreResolvedPNode | undefined = pnode;
  while (currentNode && !isElementPNode(currentNode)) {
    if (currentNode.mark) {
      marks.unshift(currentNode.mark);
    }
    currentNode = currentNode.parent;
  }
  return marks;
}

export interface DatastorePluginArgs {
  pathFromRoot: Node[];
  baseIRI: string;
}

export interface DatastorePluginState {
  datastore: () => SayStore;
  contextStore: SayStore;
}

export function datastore({
  pathFromRoot,
  baseIRI,
}: DatastorePluginArgs): ProsePlugin<DatastorePluginState> {
  const logger = createLogger('datastore');
  return new ProsePlugin<DatastorePluginState>({
    key: datastoreKey,
    state: {
      init(
        config: EditorStateConfig,
        state: EditorState,
      ): DatastorePluginState {
        const datastore = createDataStoreGetter(
          state,
          pathFromRoot,
          baseIRI,
          logger,
        );

        const refman = new ProseReferenceManager();
        const contextStore = proseStoreFromParse({
          root: { node: state.doc, from: -1, to: state.doc.nodeSize },
          parseRoot: false,
          textContent,
          tag,
          children: children(state.schema, refman),
          attributes,
          isText,

          pathFromDomRoot: pathFromRoot,
          baseIRI,
        });
        return {
          datastore,
          contextStore,
        };
      },
      apply(
        tr: Transaction,
        oldStore: DatastorePluginState,
        oldState: EditorState,
        newState: EditorState,
      ) {
        return {
          datastore: createDataStoreGetter(
            newState,
            pathFromRoot,
            baseIRI,
            logger,
          ),
          contextStore: oldStore.contextStore,
        };
      },
    },
  });
}

let stateCache: { state: EditorState; store: SayStore };

function createDataStoreGetter(
  state: EditorState,
  pathFromRoot: Node[],
  baseIRI: string,
  logger: Logger,
) {
  const refman = new ProseReferenceManager();
  return function () {
    if (stateCache && stateCache.state === state) {
      return stateCache.store;
    } else {
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
      stateCache = { state, store };
      return store;
    }
  };
}

function textContent(resolvedNode: DatastoreResolvedPNode): string {
  if (isElementPNode(resolvedNode)) {
    return resolvedNode.node.textContent;
  } else {
    return resolvedNode.domNode.textContent ?? '';
  }
}

function isText(resolvedNode: DatastoreResolvedPNode): boolean {
  return (
    isElementPNode(resolvedNode) &&
    resolvedNode.node.type.name !== 'invisible_rdfa' &&
    (resolvedNode.node.isText || resolvedNode.node.isLeaf)
  );
}

function getRdfaMarks(rdfaMarks: MarkType[], node: PNode): Mark | undefined {
  const isText = node.isText || node.isAtom || node.isLeaf;
  if (isText) {
    for (const type of rdfaMarks) {
      const mark = type.isInSet(node.marks);
      if (mark) {
        return mark;
      }
    }
  }
  return undefined;
}

function children(schema: Schema, refman: ProseReferenceManager) {
  const serializer = DOMSerializer.fromSchema(schema);
  const rdfaMarks: MarkType[] = [];
  for (const markType of Object.values(schema.marks)) {
    if (markType.spec['hasRdfa'] as boolean) {
      rdfaMarks.push(markType);
    }
  }
  return function (
    resolvedNode: DatastoreResolvedPNode,
  ): Iterable<DatastoreResolvedPNode> {
    if (isElementPNode(resolvedNode)) {
      const { from, node } = resolvedNode;
      const rslt: DatastoreResolvedPNode[] = [];
      let textBuffer: [PNode, number][] = [];

      node.descendants((child, relativePos) => {
        const absolutePos = from + 1 + relativePos;
        if (child.isText || child.isLeaf || child.isAtom) {
          textBuffer.push([child, absolutePos]);
        } else {
          if (textBuffer.length) {
            rslt.push(
              ...map(
                (pChild: TextPNode) => {
                  pChild.parent = resolvedNode;
                  return pChild;
                },
                serializeTextBlob(
                  refman,
                  rdfaMarks,
                  serializer,
                  schema,
                  textBuffer,
                ) as Iterable<TextPNode>,
              ),
            );
          }
          textBuffer = [];
          rslt.push(
            refman.get({
              node: child,
              from: absolutePos,
              to: absolutePos + child.nodeSize,
            }),
          );
        }

        return false;
      });
      if (textBuffer.length) {
        rslt.push(
          ...map(
            (pChild: TextPNode) => {
              pChild.parent = resolvedNode;
              return pChild;
            },
            serializeTextBlob(
              refman,
              rdfaMarks,
              serializer,
              schema,
              textBuffer,
            ) as Iterable<TextPNode>,
          ),
        );
      }
      return rslt;
    } else {
      return resolvedNode.children;
    }
  };
}

function serializeTextBlob(
  refman: ProseReferenceManager,
  rdfaMarks: MarkType[],
  serializer: DOMSerializer,
  schema: Schema,
  buffer: [PNode, number][],
): Iterable<DatastoreResolvedPNode> {
  let currentMark: Mark | null = null;
  let newBuffer: [PNode, number][] = [];
  const children: DatastoreResolvedPNode[] = [];
  for (const [node, pos] of buffer) {
    const rdfaMark = getRdfaMarks(rdfaMarks, node) ?? null;
    if (rdfaMark === currentMark) {
      if (rdfaMark) {
        newBuffer.push([node.mark(rdfaMark.removeFromSet(node.marks)), pos]);
      } else {
        newBuffer.push([node, pos]);
      }
    } else {
      if (newBuffer.length) {
        children.push(
          ...serializeTextBlobRec(
            refman,
            rdfaMarks,
            serializer,
            schema,
            newBuffer,
            currentMark,
          ),
        );
      }
      if (rdfaMark) {
        newBuffer = [[node.mark(rdfaMark.removeFromSet(node.marks)), pos]];
      } else {
        newBuffer = [[node, pos]];
      }
      currentMark = rdfaMark;
    }
  }
  if (newBuffer.length) {
    children.push(
      ...serializeTextBlobRec(
        refman,
        rdfaMarks,
        serializer,
        schema,
        newBuffer,
        currentMark,
      ),
    );
  }
  return children;
}

function serializeTextBlobRec(
  refman: ProseReferenceManager,
  rdfaMarks: MarkType[],
  serializer: DOMSerializer,
  schema: Schema,
  buffer: [PNode, number][],
  mark: Option<Mark>,
): Iterable<DatastoreResolvedPNode> {
  if (!mark) {
    return buffer.map(([node, pos]) =>
      refman.get({
        from: pos,
        to: pos + node.nodeSize,
        node,
      }),
    );
  } else {
    const from = buffer[0][1];
    const lastNode = unwrap(ArrayUtils.lastItem(buffer));
    const to = lastNode[1] + lastNode[0].nodeSize;
    const markSerializer = serializer.marks[mark.type.name];
    const outputSpec = markSerializer(mark, true);
    const { dom } = DOMSerializer.renderSpec(document, outputSpec);
    let currentMark: Mark | undefined = undefined;
    let newBuffer: [PNode, number][] = [];
    const children: DatastoreResolvedPNode[] = [];
    for (const [node, pos] of buffer) {
      const rdfaMark = getRdfaMarks(rdfaMarks, node);
      if (rdfaMark === currentMark) {
        if (rdfaMark) {
          newBuffer.push([node.mark(rdfaMark.removeFromSet(node.marks)), pos]);
        } else {
          newBuffer.push([node, pos]);
        }
      } else {
        if (newBuffer.length) {
          children.push(
            ...serializeTextBlobRec(
              refman,
              rdfaMarks,
              serializer,
              schema,
              newBuffer,
              currentMark,
            ),
          );
        }
        if (rdfaMark) {
          newBuffer = [[node.mark(rdfaMark?.removeFromSet(node.marks)), pos]];
        } else {
          newBuffer = [[node, pos]];
        }
        currentMark = rdfaMark;
      }
    }

    if (newBuffer.length) {
      children.push(
        ...serializeTextBlobRec(
          refman,
          rdfaMarks,
          serializer,
          schema,
          newBuffer,
          currentMark,
        ),
      );
    }
    const result = refman.get({
      mark: mark,
      from,
      to,
      domNode: dom,
      children,
    }) as TextPNode;
    (result.children as TextPNode[]).forEach(
      (child: TextPNode) => (child.parent = result),
    );
    return [result];
  }
}

function tag(resolvedNode: DatastoreResolvedPNode): string {
  if (isElementPNode(resolvedNode)) {
    return resolvedNode.node.type.name;
  } else {
    return tagName(resolvedNode.domNode);
  }
}

function attributes(
  resolvedNode: DatastoreResolvedPNode,
): Record<string, string> {
  if (isElementPNode(resolvedNode)) {
    return resolvedNode.node.attrs;
  } else {
    const { domNode } = resolvedNode;

    return isElement(domNode)
      ? objectFrom(map((attr) => [attr.name, attr.value], domNode.attributes))
      : {};
  }
}
