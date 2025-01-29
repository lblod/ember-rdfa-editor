/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { module, test } from 'qunit';
import TEST_CASES from './test-cases';
import { SAMPLE_PLUGINS, SAMPLE_SCHEMA, testEditor } from '../../utils/editor';
//@ts-expect-error graphy has no typescript definitions
import ttl_write from '@graphy/content.ttl.write';
import type { Dataset } from '@rdfjs/types';
import { calculateDataset } from '../../test-utils';

async function toTurtle(dataset: Dataset) {
  return new Promise<string>((resolve, reject) => {
    let result = '';
    const ttl_writer = ttl_write();
    ttl_writer.on('data', (chunk: string) => {
      result += chunk;
    });
    ttl_writer.on('end', () => {
      resolve(result);
    });
    ttl_writer.on('error', () => {
      reject();
    });
    dataset.forEach((quad) => ttl_writer.write(quad));
    ttl_writer.end();
  });
}

module('Integration | RDFa blackbox test ', function () {
  for (const entry of Object.entries(TEST_CASES)) {
    const [key, html] = entry;
    test(`underlying RDF stays intact - test case ${key}`, async function (assert) {
      const initialDataset = calculateDataset(html);
      const { controller } = testEditor(SAMPLE_SCHEMA, SAMPLE_PLUGINS);
      controller.initialize(html);
      const outputHTML = controller.htmlContent;
      // run through the editor twice to test for stability
      controller.initialize(outputHTML, { doNotClean: true });

      const finalHTML = controller.htmlContent;
      assert.strictEqual(outputHTML, finalHTML);
      const resultingDataset = calculateDataset(finalHTML);
      const isEqual = initialDataset.equals(resultingDataset);
      const initialTurtle = (await toTurtle(initialDataset)).trim();
      const resultingTurtle = (await toTurtle(resultingDataset)).trim();
      const message = `
        Before:
        ${initialTurtle || '<empty>'}
        After:
        ${resultingTurtle || '<empty>'}
        In 'before' but not in 'after':
        ${await toTurtle(initialDataset.minus(resultingDataset))}
        In 'after' but not in 'before':
        ${await toTurtle(resultingDataset.minus(initialDataset))}
      `;
      assert.true(isEqual, message);
    });
  }
});
