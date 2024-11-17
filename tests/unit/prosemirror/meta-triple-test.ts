import { ProseParser } from '@lblod/ember-rdfa-editor';
import type { FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import SaySerializer from '@lblod/ember-rdfa-editor/core/say-serializer';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';
import type { TransactionMonad } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { SAMPLE_PLUGINS, SAMPLE_SCHEMA } from 'dummy/tests/utils/editor';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { module, test } from 'qunit';
interface NodeJsonSpec<S extends Schema = typeof SAMPLE_SCHEMA> {
  type: S extends Schema<infer X> ? X : never;
  attrs?: Record<string, unknown>;
  content?: NodeJsonSpec<S>[];
}

function makeState(docJson: NodeJsonSpec<typeof SAMPLE_SCHEMA>): EditorState {
  const schema = SAMPLE_SCHEMA;
  return EditorState.create({
    schema,
    plugins: SAMPLE_PLUGINS,
    doc: schema.nodeFromJSON(docJson),
  });
}
module('ProseMirror | meta-triple', function () {
  test('transformMetaTriples sets doc attribute', function (assert) {
    const docJson: NodeJsonSpec = {
      type: 'doc',
      attrs: { lang: 'nl-BE' },
      content: [
        {
          type: 'block_rdfa',
          attrs: {
            about: 'http://foo.com/d6d171ad-90ca-4018-9849-170d86cb3d57',
          },
          content: [
            {
              type: 'paragraph',
              attrs: { alignment: 'left', indentationLevel: 0 },
            },
          ],
        },
      ],
    };
    const state = makeState(docJson);
    const factory = new SayDataFactory();
    const metaTriples = [
      {
        subject: factory.namedNode('http://example.org/1'),
        predicate: 'http://example.org/pred',
        object: factory.literal('test'),
      },
    ];
    const newState = state.apply(
      transformMetaTriples(() => metaTriples)(state).transaction,
    );

    assert.deepEqual(newState.doc.attrs['metaTriples'], metaTriples);
  });
  test('meta triples stay consistent across doc reloads', function (assert) {
    const factory = new SayDataFactory();
    const metaTriples = [
      {
        subject: factory.namedNode('http://example.org/1'),
        predicate: 'http://example.org/pred',
        object: factory.literal('test'),
      },
    ];
    const docJson: NodeJsonSpec = {
      type: 'doc',
      attrs: { lang: 'nl-BE', metaTriples },
      content: [
        {
          type: 'block_rdfa',
          attrs: {
            about: 'http://foo.com/d6d171ad-90ca-4018-9849-170d86cb3d57',
          },
          content: [
            {
              type: 'paragraph',
              attrs: { alignment: 'left', indentationLevel: 0 },
            },
          ],
        },
      ],
    };
    const state = makeState(docJson);

    const serializer = SaySerializer.fromSchema(state.schema);
    const html = serializer.serializeNode(state.doc) as HTMLElement;

    const parser = ProseParser.fromSchema(state.schema);
    const newDoc = htmlToDoc(html.outerHTML, {
      schema: state.schema,
      parser,
    });
    assert.deepEqual(
      newDoc.attrs['metaTriples'],
      state.doc.attrs['metaTriples'],
    );
  });
});
function transformMetaTriples(
  transformer: (oldTriples: FullTriple[]) => FullTriple[],
  pos: number = -1,
): TransactionMonad<boolean> {
  return function (state: EditorState) {
    const tr = state.tr;
    if (pos === -1) {
      return {
        transaction: tr.setDocAttribute(
          'metaTriples',
          transformer(state.doc.attrs['metaTriples'] ?? []),
        ),
        initialState: state,
        result: true,
      };
    } else {
      const node = state.doc.nodeAt(pos);
      if (node?.type.spec.attrs?.['metaTriples']) {
        return {
          initialState: state,
          transaction: tr.setNodeAttribute(
            pos,
            'metaTriples',
            transformer(node.attrs['metaTriples'] ?? []),
          ),
          result: true,
        };
      } else {
        return {
          initialState: state,
          transaction: tr,
          result: false,
        };
      }
    }
  };
}
function setMetaTriples(triples: FullTriple[], pos: number = -1) {
  return transformMetaTriples(() => triples, pos);
}
function addMetaTriples(triples: FullTriple[], pos: number = -1) {
  return transformMetaTriples((oldTriples) => oldTriples.concat(triples), pos);
}
