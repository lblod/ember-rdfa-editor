/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

import { module, test } from 'qunit';
import TEST_CASES from './test-cases';
import { EditorStore } from '@lblod/ember-rdfa-editor/utils/_private/datastore/datastore';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import {
  SAMPLE_PLUGINS,
  SAMPLE_SCHEMA,
  testEditor,
} from 'dummy/tests/utils/editor';
//@ts-expect-error graphy has no typescript definitions
import ttl_write from '@graphy/content.ttl.write';
import { Dataset } from '@rdfjs/types';
import { FastDataset } from '@graphy/memory.dataset.fast';

function calculateDataset(html: string) {
  const domParser = new DOMParser();
  const parsedHTML = domParser.parseFromString(html, 'text/html');
  const datastore = EditorStore.fromParse<Node>({
    parseRoot: true,
    root: parsedHTML,
    baseIRI: 'http://example.org',
    tag: tagName,
    attributes(node: Node): Record<string, string> {
      if (isElement(node)) {
        const result: Record<string, string> = {};
        for (const attr of node.attributes) {
          result[attr.name] = attr.value;
        }
        return result;
      }
      return {};
    },
    isText: isTextNode,
    children(node: Node): Iterable<Node> {
      return node.childNodes;
    },
    pathFromDomRoot: [],
    textContent(node: Node): string {
      return node.textContent || '';
    },
  });
  return datastore.dataset as unknown as FastDataset;
}

async function toTurtle(dataset: Dataset) {
  return new Promise<string>((resolve, reject) => {
    let result = '';
    const ttl_writer = ttl_write();
    ttl_writer.on('data', (chunk) => {
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
      controller.initialize(outputHTML);

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
