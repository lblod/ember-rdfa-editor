import { module, test } from 'qunit';
import { builders } from 'prosemirror-test-builder';
import {
  SAMPLE_PLUGINS,
  SAMPLE_SCHEMA,
} from 'test-app/tests/helpers/prosemirror';
import { EditorState, PNode, type RdfaAttrs } from '@lblod/ember-rdfa-editor';
import {
  getNodeByRdfaId,
  updateSubject,
  type UpdateSubjectArgs,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info/utils';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type { FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
const { doc, block_rdfa, paragraph } = builders(SAMPLE_SCHEMA);

const executeAndApplyUpdateSubjectOperation = (args: UpdateSubjectArgs) => {
  return (state: EditorState) => {
    const operationResult = updateSubject(args)(state);
    if (!operationResult.result) {
      return {
        success: false,
        state,
      };
    } else {
      return {
        success: true,
        state: state.apply(operationResult.transaction),
      };
    }
  };
};

const createEditorState = (doc?: PNode) => {
  return EditorState.create({
    schema: SAMPLE_SCHEMA,
    plugins: SAMPLE_PLUGINS,
    doc,
  });
};

module('rdfa | updateSubject', (hooks) => {
  hooks.beforeEach(() => {
    QUnit.dump.maxDepth = 15;
  });

  module('Simple cases', () => {
    test('Simple case without relationships', (assert) => {
      const initalSubject = `http://example.org/1`;
      const targetSubject = `http://example.org/2`;
      const initialDoc = doc(
        {},
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: initalSubject,
            __rdfaId: '1',
            properties: [],
            backlinks: [],
          },
          paragraph('content'),
        ),
      );

      const expectedDoc = doc(
        {},
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: targetSubject,
            __rdfaId: '1',
            properties: [],
            backlinks: [],
          },
          paragraph('content'),
        ),
      );

      const initialState = createEditorState(initialDoc);

      const nodeToUpdate = unwrap(getNodeByRdfaId(initialState, '1'));
      const operationResult = executeAndApplyUpdateSubjectOperation({
        pos: nodeToUpdate.pos,
        targetSubject,
        keepBacklinks: false,
        keepProperties: false,
        keepExternalTriples: false,
      })(initialState);
      assert.true(operationResult.success);

      const resultState = operationResult.state;
      assert.deepEqual(resultState.doc.toJSON(), expectedDoc.toJSON());
    });
    module('External triples', () => {
      const initalSubject = `http://example.org/1`;
      const targetSubject = `http://example.org/2`;
      const externalTriples: FullTriple[] = [
        {
          subject: sayDataFactory.namedNode('http://example.org/3'),
          predicate: 'http://predicate.org/1',
          object: sayDataFactory.literal('literal'),
        },
      ];
      const initialDoc = doc(
        {},
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: initalSubject,
            __rdfaId: '1',
            properties: [],
            backlinks: [],
            externalTriples,
          },
          paragraph('content'),
        ),
      );
      test('External triples are preserved if requested', (assert) => {
        const expectedDoc = doc(
          {},
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: targetSubject,
              __rdfaId: '1',
              properties: [],
              backlinks: [],
              externalTriples,
            },
            paragraph('content'),
          ),
        );

        const initialState = createEditorState(initialDoc);

        const nodeToUpdate = unwrap(getNodeByRdfaId(initialState, '1'));
        const operationResult = executeAndApplyUpdateSubjectOperation({
          pos: nodeToUpdate.pos,
          targetSubject,
          keepBacklinks: false,
          keepProperties: false,
          keepExternalTriples: true,
        })(initialState);
        assert.true(operationResult.success);

        const resultState = operationResult.state;
        assert.deepEqual(resultState.doc.toJSON(), expectedDoc.toJSON());
      });

      test('External triples are not preserved if requested', (assert) => {
        const expectedDoc = doc(
          {},
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: targetSubject,
              __rdfaId: '1',
              properties: [],
              backlinks: [],
              externalTriples: [],
            },
            paragraph('content'),
          ),
        );

        const initialState = createEditorState(initialDoc);

        const nodeToUpdate = unwrap(getNodeByRdfaId(initialState, '1'));
        const operationResult = executeAndApplyUpdateSubjectOperation({
          pos: nodeToUpdate.pos,
          targetSubject,
          keepBacklinks: false,
          keepProperties: false,
          keepExternalTriples: false,
        })(initialState);
        assert.true(operationResult.success);

        const resultState = operationResult.state;
        assert.deepEqual(resultState.doc.toJSON(), expectedDoc.toJSON());
      });
    });
  });

  module('Extended cases', () => {
    module('Extended case 1', () => {
      const initialDoc = doc(
        {},
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: 'http://example.org/original',
            __rdfaId: '1',
            properties: [
              {
                predicate: 'http://predicates.org/1',
                object: sayDataFactory.literalNode('5'),
              },
              {
                predicate: 'http://predicates.org/2',
                object: sayDataFactory.namedNode('http://named-nodes.org/1'),
              },
            ],
            backlinks: [
              {
                subject: sayDataFactory.resourceNode(
                  'http://example.org/parent',
                ),
                predicate: 'http://predicates.org/3',
              },
            ],
          } as RdfaAttrs,
          paragraph('Content'),
        ),
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: 'http://example.org/original',
            __rdfaId: '2',
            properties: [
              {
                predicate: 'http://predicates.org/1',
                object: sayDataFactory.literalNode('5'),
              },
              {
                predicate: 'http://predicates.org/2',
                object: sayDataFactory.namedNode('http://named-nodes.org/1'),
              },
            ],
            backlinks: [
              {
                subject: sayDataFactory.resourceNode(
                  'http://example.org/parent',
                ),
                predicate: 'http://predicates.org/3',
              },
            ],
          } as RdfaAttrs,
          paragraph('Content'),
        ),
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: 'http://example.org/parent',
            __rdfaId: '3',
            properties: [
              {
                predicate: 'http://predicates.org/3',
                object: sayDataFactory.resourceNode(
                  'http://example.org/original',
                ),
              },
              {
                predicate: 'http://predicates.org/4',
                object: sayDataFactory.resourceNode(
                  'http://example.org/target',
                ),
              },
            ],
            backlinks: [],
          } as RdfaAttrs,
          paragraph('Content'),
        ),
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: 'http://example.org/target',
            __rdfaId: '4',
            properties: [
              {
                predicate: 'http://predicates.org/4',
                object: sayDataFactory.literal('Inline literal'),
              },
            ],
            backlinks: [
              {
                subject: sayDataFactory.resourceNode(
                  'http://example.org/parent',
                ),
                predicate: 'http://predicates.org/4',
              },
            ],
          } as RdfaAttrs,
          paragraph('Content'),
        ),
        block_rdfa(
          {
            rdfaNodeType: 'literal',
            __rdfaId: '5',
            properties: [],
            backlinks: [
              {
                subject: sayDataFactory.literalNode(
                  'http://example.org/original',
                ),
                predicate: 'http://predicates.org/1',
              },
            ],
            content: null,
          } as RdfaAttrs,
          paragraph('Content'),
        ),
      );
      test('does not preserve relationships when requested', (assert) => {
        const expectedDoc = doc(
          {},
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/target',
              __rdfaId: '1',
              properties: [
                {
                  predicate: 'http://predicates.org/4',
                  object: sayDataFactory.literal('Inline literal'),
                },
              ],
              backlinks: [
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/4',
                },
              ],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/original',
              __rdfaId: '2',
              properties: [
                {
                  predicate: 'http://predicates.org/1',
                  object: sayDataFactory.literalNode('5'),
                },
                {
                  predicate: 'http://predicates.org/2',
                  object: sayDataFactory.namedNode('http://named-nodes.org/1'),
                },
              ],
              backlinks: [
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/3',
                },
              ],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/parent',
              __rdfaId: '3',
              properties: [
                {
                  predicate: 'http://predicates.org/3',
                  object: sayDataFactory.resourceNode(
                    'http://example.org/original',
                  ),
                },
                {
                  predicate: 'http://predicates.org/4',
                  object: sayDataFactory.resourceNode(
                    'http://example.org/target',
                  ),
                },
              ],
              backlinks: [],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/target',
              __rdfaId: '4',
              properties: [
                {
                  predicate: 'http://predicates.org/4',
                  object: sayDataFactory.literal('Inline literal'),
                },
              ],
              backlinks: [
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/4',
                },
              ],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'literal',
              __rdfaId: '5',
              properties: [],
              backlinks: [
                {
                  subject: sayDataFactory.literalNode(
                    'http://example.org/original',
                  ),
                  predicate: 'http://predicates.org/1',
                },
              ],
              content: null,
            } as RdfaAttrs,
            paragraph('Content'),
          ),
        );
        const initialState = createEditorState(initialDoc);
        const nodeToUpdate = unwrap(getNodeByRdfaId(initialState, '1'));
        const operationResult = executeAndApplyUpdateSubjectOperation({
          pos: nodeToUpdate.pos,
          targetSubject: 'http://example.org/target',
          keepBacklinks: false,
          keepProperties: false,
          keepExternalTriples: false,
        })(initialState);
        assert.true(operationResult.success);

        const resultState = operationResult.state;
        assert.deepEqual(resultState.doc.toJSON(), expectedDoc.toJSON());
      });
      test('preserves backlinks when requested', (assert) => {
        const expectedDoc = doc(
          {},
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/target',
              __rdfaId: '1',
              properties: [
                {
                  predicate: 'http://predicates.org/4',
                  object: sayDataFactory.literal('Inline literal'),
                },
              ],
              backlinks: [
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/4',
                },
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/3',
                },
              ],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/original',
              __rdfaId: '2',
              properties: [
                {
                  predicate: 'http://predicates.org/1',
                  object: sayDataFactory.literalNode('5'),
                },
                {
                  predicate: 'http://predicates.org/2',
                  object: sayDataFactory.namedNode('http://named-nodes.org/1'),
                },
              ],
              backlinks: [
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/3',
                },
              ],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/parent',
              __rdfaId: '3',
              properties: [
                {
                  predicate: 'http://predicates.org/3',
                  object: sayDataFactory.resourceNode(
                    'http://example.org/original',
                  ),
                },
                {
                  predicate: 'http://predicates.org/4',
                  object: sayDataFactory.resourceNode(
                    'http://example.org/target',
                  ),
                },
                {
                  predicate: 'http://predicates.org/3',
                  object: sayDataFactory.resourceNode(
                    'http://example.org/target',
                  ),
                },
              ],
              backlinks: [],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/target',
              __rdfaId: '4',
              properties: [
                {
                  predicate: 'http://predicates.org/4',
                  object: sayDataFactory.literal('Inline literal'),
                },
              ],
              backlinks: [
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/4',
                },
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/3',
                },
              ],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'literal',
              __rdfaId: '5',
              properties: [],
              backlinks: [
                {
                  subject: sayDataFactory.literalNode(
                    'http://example.org/original',
                  ),
                  predicate: 'http://predicates.org/1',
                },
              ],
              content: null,
            } as RdfaAttrs,
            paragraph('Content'),
          ),
        );
        const initialState = createEditorState(initialDoc);
        const nodeToUpdate = unwrap(getNodeByRdfaId(initialState, '1'));
        const operationResult = executeAndApplyUpdateSubjectOperation({
          pos: nodeToUpdate.pos,
          targetSubject: 'http://example.org/target',
          keepBacklinks: true,
          keepProperties: false,
          keepExternalTriples: false,
        })(initialState);
        assert.true(operationResult.success);

        const resultState = operationResult.state;
        assert.deepEqual(resultState.doc.toJSON(), expectedDoc.toJSON());
      });
      test('preserves properties and backlinks when requested', (assert) => {
        const expectedDoc = doc(
          {},
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/target',
              __rdfaId: '1',
              properties: [
                {
                  predicate: 'http://predicates.org/4',
                  object: sayDataFactory.literal('Inline literal'),
                },
                {
                  predicate: 'http://predicates.org/1',
                  object: sayDataFactory.literalNode('5'),
                },
                {
                  predicate: 'http://predicates.org/2',
                  object: sayDataFactory.namedNode('http://named-nodes.org/1'),
                },
              ],
              backlinks: [
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/4',
                },
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/3',
                },
              ],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/original',
              __rdfaId: '2',
              properties: [
                {
                  predicate: 'http://predicates.org/1',
                  object: sayDataFactory.literalNode('5'),
                },
                {
                  predicate: 'http://predicates.org/2',
                  object: sayDataFactory.namedNode('http://named-nodes.org/1'),
                },
              ],
              backlinks: [
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/3',
                },
              ],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/parent',
              __rdfaId: '3',
              properties: [
                {
                  predicate: 'http://predicates.org/3',
                  object: sayDataFactory.resourceNode(
                    'http://example.org/original',
                  ),
                },
                {
                  predicate: 'http://predicates.org/4',
                  object: sayDataFactory.resourceNode(
                    'http://example.org/target',
                  ),
                },
                {
                  predicate: 'http://predicates.org/3',
                  object: sayDataFactory.resourceNode(
                    'http://example.org/target',
                  ),
                },
              ],
              backlinks: [],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'resource',
              subject: 'http://example.org/target',
              __rdfaId: '4',
              properties: [
                {
                  predicate: 'http://predicates.org/4',
                  object: sayDataFactory.literal('Inline literal'),
                },
                {
                  predicate: 'http://predicates.org/1',
                  object: sayDataFactory.literalNode('5'),
                },
                {
                  predicate: 'http://predicates.org/2',
                  object: sayDataFactory.namedNode('http://named-nodes.org/1'),
                },
              ],
              backlinks: [
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/4',
                },
                {
                  subject: sayDataFactory.resourceNode(
                    'http://example.org/parent',
                  ),
                  predicate: 'http://predicates.org/3',
                },
              ],
            } as RdfaAttrs,
            paragraph('Content'),
          ),
          block_rdfa(
            {
              rdfaNodeType: 'literal',
              __rdfaId: '5',
              properties: [],
              backlinks: [
                {
                  subject: sayDataFactory.literalNode(
                    'http://example.org/original',
                  ),
                  predicate: 'http://predicates.org/1',
                },
                {
                  subject: sayDataFactory.literalNode(
                    'http://example.org/target',
                  ),
                  predicate: 'http://predicates.org/1',
                },
              ],
              content: null,
            } as RdfaAttrs,
            paragraph('Content'),
          ),
        );
        const initialState = createEditorState(initialDoc);
        const nodeToUpdate = unwrap(getNodeByRdfaId(initialState, '1'));
        const operationResult = executeAndApplyUpdateSubjectOperation({
          pos: nodeToUpdate.pos,
          targetSubject: 'http://example.org/target',
          keepBacklinks: true,
          keepProperties: true,
          keepExternalTriples: false,
        })(initialState);
        assert.true(operationResult.success);

        const resultState = operationResult.state;
        assert.deepEqual(resultState.doc.toJSON(), expectedDoc.toJSON());
      });
    });
    test('Extended case 2 - target resource has relationship to original resource', (assert) => {
      const initialDoc = doc(
        {},
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: 'http://example.org/original',
            __rdfaId: '1',
            properties: [
              {
                predicate: 'http://predicates.org/1',
                object: sayDataFactory.literalNode('3'),
              },
              {
                predicate: 'http://predicates.org/2',
                object: sayDataFactory.namedNode('http://named-nodes.org/1'),
              },
            ],
            backlinks: [
              {
                subject: sayDataFactory.resourceNode(
                  'http://example.org/target',
                ),
                predicate: 'http://predicates.org/4',
              },
            ],
          } as RdfaAttrs,
          paragraph('Content'),
        ),
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: 'http://example.org/target',
            __rdfaId: '2',
            properties: [
              {
                predicate: 'http://predicates.org/3',
                object: sayDataFactory.literal('Inline literal'),
              },
              {
                predicate: 'http://predicates.org/4',
                object: sayDataFactory.resourceNode(
                  'http://example.org/original',
                ),
              },
            ],
            backlinks: [],
          } as RdfaAttrs,
          paragraph('Content'),
        ),
        block_rdfa(
          {
            rdfaNodeType: 'literal',
            __rdfaId: '3',
            properties: [],
            backlinks: [
              {
                subject: sayDataFactory.literalNode(
                  'http://example.org/original',
                ),
                predicate: 'http://predicates.org/1',
              },
            ],
            content: null,
          } as RdfaAttrs,
          paragraph('Content'),
        ),
      );
      const expectedDoc = doc(
        {},
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: 'http://example.org/target',
            __rdfaId: '1',
            properties: [
              {
                predicate: 'http://predicates.org/3',
                object: sayDataFactory.literal('Inline literal'),
              },
              {
                predicate: 'http://predicates.org/4',
                object: sayDataFactory.resourceNode(
                  'http://example.org/target',
                ),
              },
              {
                predicate: 'http://predicates.org/1',
                object: sayDataFactory.literalNode('5'),
              },
              {
                predicate: 'http://predicates.org/2',
                object: sayDataFactory.namedNode('http://named-nodes.org/1'),
              },
            ],
            backlinks: [
              {
                subject: sayDataFactory.resourceNode(
                  'http://example.org/target',
                ),
                predicate: 'http://predicates.org/4',
              },
            ],
          } as RdfaAttrs,
          paragraph('Content'),
        ),
        block_rdfa(
          {
            rdfaNodeType: 'resource',
            subject: 'http://example.org/target',
            __rdfaId: '2',
            properties: [
              {
                predicate: 'http://predicates.org/3',
                object: sayDataFactory.literal('Inline literal'),
              },
              {
                predicate: 'http://predicates.org/4',
                object: sayDataFactory.resourceNode(
                  'http://example.org/target',
                ),
              },
              {
                predicate: 'http://predicates.org/1',
                object: sayDataFactory.literalNode('5'),
              },
              {
                predicate: 'http://predicates.org/2',
                object: sayDataFactory.namedNode('http://named-nodes.org/1'),
              },
            ],
            backlinks: [
              {
                subject: sayDataFactory.resourceNode(
                  'http://example.org/target',
                ),
                predicate: 'http://predicates.org/4',
              },
            ],
          } as RdfaAttrs,
          paragraph('Content'),
        ),
        block_rdfa(
          {
            rdfaNodeType: 'literal',
            __rdfaId: '3',
            properties: [],
            backlinks: [
              {
                subject: sayDataFactory.literalNode(
                  'http://example.org/target',
                ),
                predicate: 'http://predicates.org/1',
              },
            ],
            content: null,
          } as RdfaAttrs,
          paragraph('Content'),
        ),
      );
      const initialState = createEditorState(initialDoc);

      const nodeToUpdate = unwrap(getNodeByRdfaId(initialState, '1'));
      const operationResult = executeAndApplyUpdateSubjectOperation({
        pos: nodeToUpdate.pos,
        targetSubject: 'http://example.org/target',
        keepBacklinks: true,
        keepProperties: true,
        keepExternalTriples: false,
      })(initialState);
      assert.true(operationResult.success);

      const resultState = operationResult.state;
      assert.deepEqual(resultState.doc.toJSON(), expectedDoc.toJSON());
    });
  });
});
