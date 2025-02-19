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
});
