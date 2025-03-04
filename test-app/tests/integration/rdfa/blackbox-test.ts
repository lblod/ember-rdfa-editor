/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { module, test } from 'qunit';
import TEST_CASES from './test-cases';
//@ts-expect-error graphy has no typescript definitions
import toNT from '@rdfjs/to-ntriples';
import { calculateDataset } from 'test-app/tests/helpers/datastore';
import { testEditor } from 'test-app/tests/helpers/say-editor';
import {
  SAMPLE_PLUGINS,
  SAMPLE_SCHEMA,
} from 'test-app/tests/helpers/prosemirror';
import { findNodesBySubject } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { isSome } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

module('Integration | RDFa blackbox test ', function () {
  for (const entry of Object.entries(TEST_CASES)) {
    const [key, html] = entry;
    test(`underlying RDF stays intact - test case ${key}`, async function (assert) {
      const initialDataset = calculateDataset(html);
      const { controller } = testEditor(SAMPLE_SCHEMA, {
        plugins: SAMPLE_PLUGINS,
        override: true,
      });
      controller.initialize(html);
      const outputHTML = controller.htmlContent;
      // run through the editor twice to test for stability
      controller.initialize(outputHTML, { doNotClean: true });

      const finalHTML = controller.htmlContent;
      assert.strictEqual(outputHTML, finalHTML);
      const resultingDataset = calculateDataset(finalHTML);
      const isEqual = initialDataset.equals(resultingDataset);
      const initialTurtle = (await toNT(initialDataset)).trim();
      const resultingTurtle = (await toNT(resultingDataset)).trim();
      const message = `
        Before:
        ${initialTurtle || '<empty>'}
        After:
        ${resultingTurtle || '<empty>'}
        In 'before' but not in 'after':
        ${await toNT(initialDataset.minus(resultingDataset))}
        In 'after' but not in 'before':
        ${await toNT(resultingDataset.minus(initialDataset))}
      `;
      assert.true(isEqual, message);
    });
  }
  test('__rdfaId attributes should be persisted throughout parsing and serializing steps', (assert) => {
    const { controller } = testEditor(SAMPLE_SCHEMA, {
      override: true,
      plugins: SAMPLE_PLUGINS,
    });
    const htmlContent = `
      <div
        class="say-editable say-block-rdfa"
        about="http://example.com/c3d0f3a2-1314-4686-aa30-f46fd1f988f7"
        data-say-id="c3d0f3a2-1314-4686-aa30-f46fd1f988f7"
      >
        <div
          style="display: none"
          class="say-hidden"
          data-rdfa-container="true"
        >
          <span property="ext:content" content="test" lang="nl-be"></span>
        </div>
        <div data-content-container="true">
            <p class="say-paragraph"></p>
        </div>
      </div>
      <div
        class="say-editable say-block-rdfa"
        data-label="literal"
        about="http://example.com/c3d0f3a2-1314-4686-aa30-f46fd1f988f7"
        property="ext:toLiteral"
        lang="nl-be"
        data-literal-node="true"
        data-say-id="f6a0b16d-0b7f-4c27-8111-a7ebf12ab103"
      >
        <div
          style="display: none"
          class="say-hidden"
          data-rdfa-container="true"
        >
        </div>
        <div data-content-container="true">
          <p class="say-paragraph">Some content</p>
        </div>
      </div>
    `;
    console.log('HTML Content: ', htmlContent);
    // Initial parse
    controller.initialize(htmlContent);
    // Serialize + parse
    controller.initialize(controller.htmlContent);
    const { doc } = controller.mainEditorState;
    const resourceNode = findNodesBySubject(
      doc,
      'http://example.com/c3d0f3a2-1314-4686-aa30-f46fd1f988f7',
    )[0].value;
    assert.deepEqual(
      resourceNode.attrs['__rdfaId'],
      'c3d0f3a2-1314-4686-aa30-f46fd1f988f7',
    );
    const properties = resourceNode.attrs['properties'] as OutgoingTriple[];
    assert.strictEqual(properties.length, 2);
    const propertyToLiteralNode = properties.find(
      (prop) => prop.object.termType === 'LiteralNode',
    );
    assert.true(isSome(propertyToLiteralNode));
    assert.strictEqual(
      propertyToLiteralNode!.object.value,
      'f6a0b16d-0b7f-4c27-8111-a7ebf12ab103',
    );
  });
});
