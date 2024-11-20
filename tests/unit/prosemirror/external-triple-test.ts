import { ProseParser } from '@lblod/ember-rdfa-editor';
import { SayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import SaySerializer from '@lblod/ember-rdfa-editor/core/say-serializer';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';
import { transformExternalTriples } from '@lblod/ember-rdfa-editor/utils/external-triple-utils';
import { calculateDataset } from 'dummy/tests/test-utils';
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
module('ProseMirror | external-triple', function () {
  test('transformExternalTriples sets doc attribute', function (assert) {
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
    const externalTriples = [
      {
        subject: factory.namedNode('http://example.org/1'),
        predicate: 'http://example.org/pred',
        object: factory.literal('test'),
      },
    ];
    const newState = state.apply(
      transformExternalTriples(() => externalTriples)(state).transaction,
    );

    assert.deepEqual(newState.doc.attrs['externalTriples'], externalTriples);
  });
  test('external triples stay consistent across doc reloads', function (assert) {
    const factory = new SayDataFactory();
    const externalTriples = [
      {
        subject: factory.namedNode('http://example.org/1'),
        predicate: 'http://example.org/pred',
        object: factory.literal('test'),
      },
    ];
    const docJson: NodeJsonSpec = {
      type: 'doc',
      attrs: { lang: 'nl-BE', externalTriples },
      content: [
        {
          type: 'paragraph',
          attrs: { alignment: 'left', indentationLevel: 0 },
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
      newDoc.attrs['externalTriples'],
      state.doc.attrs['externalTriples'],
    );
    const html2 = serializer.serializeNode(newDoc);
    assert.deepEqual(html2, html, 'second reload');
  });

  test('external triples get rendered as parseable rdfa', function (assert) {
    const factory = new SayDataFactory();
    const quad = factory.quad(
      factory.namedNode('http://example.org/1'),
      factory.namedNode('http://example.org/pred'),
      factory.literal('test'),
    );
    const externalTriples = [
      {
        subject: quad.subject,
        predicate: quad.predicate.value,
        object: quad.object,
      },
    ];
    const docJson: NodeJsonSpec = {
      type: 'doc',
      attrs: { lang: 'nl-BE', externalTriples },
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
    const dataset = calculateDataset(html.outerHTML);

    assert.strictEqual(
      dataset.match(quad.subject, quad.predicate, quad.object).size,
      1,
    );
  });

  test('triples with distinct subjects stay consistent across doc reloads on non-doc nodes', function (assert) {
    const factory = new SayDataFactory();
    const docExternalTriples = [
      {
        subject: factory.namedNode('http://example.org/1'),
        predicate: 'http://example.org/pred',
        object: factory.literal('test'),
      },
    ];
    const blockExternalTriples = [
      {
        subject: factory.namedNode('http://example.org/2'),
        predicate: 'http://example.org/pred',
        object: factory.namedNode(
          'http://dbpedia.org/ontology/CyclingCompetition',
        ),
      },
    ];
    const docJson: NodeJsonSpec = {
      type: 'doc',
      attrs: {
        properties: [],
        backlinks: [],
        externalTriples: docExternalTriples,
        subject: null,
        lang: 'nl-BE',
      },
      content: [
        {
          type: 'block_rdfa',
          attrs: {
            properties: [],
            backlinks: [],
            externalTriples: blockExternalTriples,
            __rdfaId: 'f264819a-05a0-4909-b08a-313abccc9139',
            rdfaNodeType: 'resource',
            subject: 'http://example.org/6238392a-a4c4-44d0-9b98-a79257b5c54a',
          },
          content: [
            {
              type: 'paragraph',
              attrs: {
                alignment: 'left',
                indentationLevel: 0,
              },
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
      newDoc.attrs['externalTriples'],
      state.doc.attrs['externalTriples'],
    );
    const html2 = serializer.serializeNode(newDoc);
    assert.deepEqual(html2, html, 'second reload');
  });

  // TODO: I'm not sure we actually want this behavior, but not having it would
  // mean quite a significant rework of the parsing logic, and it is at least
  // somewhat logical, so I'm adding this test to document it and alert us if it
  // changes
  test('triple information gets collated onto the first (document-order) node which defined the subject', function (assert) {
    const factory = new SayDataFactory();
    const docExternalTriples = [
      {
        subject: factory.namedNode('http://example.org/1'),
        predicate: 'http://example.org/pred',
        object: factory.literal('test'),
      },
    ];
    const blockExternalTriples = [
      {
        subject: factory.namedNode('http://example.org/1'),
        predicate: 'http://example.org/pred',
        object: factory.namedNode(
          'http://dbpedia.org/ontology/CyclingCompetition',
        ),
      },
    ];
    const docJson: NodeJsonSpec = {
      type: 'doc',
      attrs: {
        properties: [],
        backlinks: [],
        externalTriples: docExternalTriples,
        subject: null,
        lang: 'nl-BE',
      },
      content: [
        {
          type: 'block_rdfa',
          attrs: {
            properties: [],
            backlinks: [],
            externalTriples: blockExternalTriples,
            __rdfaId: 'f264819a-05a0-4909-b08a-313abccc9139',
            rdfaNodeType: 'resource',
            subject: 'http://example.org/6238392a-a4c4-44d0-9b98-a79257b5c54a',
          },
          content: [
            {
              type: 'paragraph',
              attrs: {
                alignment: 'left',
                indentationLevel: 0,
              },
            },
          ],
        },
      ],
    };
    const expectedTriples = [...docExternalTriples, ...blockExternalTriples];
    const state = makeState(docJson);

    const serializer = SaySerializer.fromSchema(state.schema);
    const html = serializer.serializeNode(state.doc) as HTMLElement;

    const parser = ProseParser.fromSchema(state.schema);
    const newDoc = htmlToDoc(html.outerHTML, {
      schema: state.schema,
      parser,
    });
    assert.deepEqual(
      newDoc.attrs['externalTriples'],
      expectedTriples,
      "'first' node that talks about subject collects all info about it",
    );
    assert.deepEqual(
      newDoc.content.child(0).attrs['externalTriples'],
      [],
      "other nodes don't have the info anymore",
    );
  });

  test('multiple subjects on a single node get stored correctly', function (assert) {
    const factory = new SayDataFactory();
    const docExternalTriples = [
      {
        subject: factory.namedNode('http://example.org/1'),
        predicate: 'http://example.org/pred',
        object: factory.literal('test'),
      },
      {
        subject: factory.namedNode('http://example.org/2'),
        predicate: 'http://example.org/pred',
        object: factory.literal('test'),
      },
      {
        subject: factory.namedNode('http://example.org/3'),
        predicate: 'http://example.org/pred',
        object: factory.literal('test'),
      },
      {
        subject: factory.namedNode('http://example.org/3'),
        predicate: 'http://example.org/pred',
        object: factory.literal('abc'),
      },
    ];
    const docJson: NodeJsonSpec = {
      type: 'doc',
      attrs: {
        properties: [],
        backlinks: [],
        externalTriples: docExternalTriples,
        subject: null,
        lang: 'nl-BE',
      },
      content: [
        {
          type: 'paragraph',
          attrs: {
            alignment: 'left',
            indentationLevel: 0,
          },
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
      newDoc.attrs['externalTriples'],
      state.doc.attrs['externalTriples'],
    );
    const html2 = serializer.serializeNode(newDoc);
    assert.deepEqual(html2, html, 'second reload');
  });
});
