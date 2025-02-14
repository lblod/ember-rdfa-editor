import { makeState } from '../../test-utils';
import type { NodeJsonSpec } from '../../test-utils';
import { module, test } from 'qunit';
module('ProseMirror | plugins | removePropertiesOfDeletedNodes', function () {
  test('removePropertiesOfDeletedNodes plugin only removes the backlink to the target subject', function (assert) {
    // doc with 3 block rdfa nodes as children
    // the first node is linked to 2 and 3 using the same predicate
    const docJson: NodeJsonSpec = {
      type: 'doc',
      attrs: {
        properties: [],
        backlinks: [],
        externalTriples: [],
        subject: null,
        lang: 'nl-BE',
      },
      content: [
        {
          type: 'block_rdfa',
          attrs: {
            properties: [
              {
                predicate: 'ext:testPred',
                object: {
                  termType: 'ResourceNode',
                  value: 'http://example.org/3',
                },
              },
              {
                predicate: 'ext:testPred',
                object: {
                  termType: 'ResourceNode',
                  value: 'http://example.org/2',
                },
              },
            ],
            backlinks: [],
            externalTriples: [],
            __rdfaId: 'cc676bb2-e51c-4703-a3e7-d85c57d26ecf',
            rdfaNodeType: 'resource',
            subject: 'http://example.org/1',
          },
          content: [
            {
              type: 'paragraph',
              attrs: {
                alignment: 'left',
                indentationLevel: 0,
              },
              content: [
                {
                  type: 'text',
                  text: 'foo',
                },
              ],
            },
          ],
        },
        {
          type: 'block_rdfa',
          attrs: {
            properties: [],
            backlinks: [
              {
                subject: {
                  termType: 'ResourceNode',
                  value: 'http://example.org/1',
                },
                predicate: 'ext:testPred',
              },
            ],
            externalTriples: [],
            __rdfaId: 'b5cb5b9b-1f00-4250-af8a-c15a571ce852',
            rdfaNodeType: 'resource',
            subject: 'http://example.org/2',
          },
          content: [
            {
              type: 'paragraph',
              attrs: {
                alignment: 'left',
                indentationLevel: 0,
              },
              content: [
                {
                  type: 'text',
                  text: 'bar',
                },
              ],
            },
          ],
        },
        {
          type: 'block_rdfa',
          attrs: {
            properties: [],
            backlinks: [
              {
                subject: {
                  termType: 'ResourceNode',
                  value: 'http://example.org/1',
                },
                predicate: 'ext:testPred',
              },
            ],
            externalTriples: [],
            __rdfaId: '680f7805-d638-44c8-b279-4e37ef9506cf',
            rdfaNodeType: 'resource',
            subject: 'http://example.org/3',
          },
          content: [
            {
              type: 'paragraph',
              attrs: {
                alignment: 'left',
                indentationLevel: 0,
              },
              content: [
                {
                  type: 'text',
                  text: 'baz',
                },
              ],
            },
          ],
        },
      ],
    };

    const state = makeState(docJson);
    // we remove the 3rd node from the document. Thanks to the
    // removePropertiesOfDeletedNodes plugin, this will also remove the
    // outgoing relation ship on the 1st node
    const newState = state.apply(state.tr.deleteRange(14, 21));

    const firstNode = newState.doc.content.firstChild;
    // we now check that the relationship between the 1st and 2nd node isn't
    // accidentally removed
    assert.strictEqual(
      (firstNode?.attrs['properties'] as unknown[])?.length,
      1,
      'first node needs to still have 1 outgoing property left',
    );
  });
});
