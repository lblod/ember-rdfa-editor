/* eslint-disable */
// TODO: linting disabled cause of really bad and incomplete qunit typings, fix
import * as QUnit from 'qunit';
import Application from 'test-app/app';
import config from 'test-app/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start as qunitStart } from 'ember-qunit';
import { setup as setupDom } from 'qunit-dom';
import { nodeParser } from './helpers/qunit/parsers';
import { deepArrayContains } from './helpers/qunit/assertions';
interface CustomAssert {
  htmlStringEqual(actual: string, expected: string, message?: string): void;
}
declare global {
  interface Assert extends CustomAssert {}
}
export function start() {
  // Set-up custom parsers and assertions
  // @ts-expect-error This method exists, just seems to be missing in the types
  QUnit.dump.setParser('node', nodeParser);
  QUnit.assert.deepArrayContains = deepArrayContains;
  QUnit.assert.htmlStringEqual = function (
    actual: string,
    expected: string,
    message?: string,
  ) {
    const parser = new DOMParser();
    const actualDOM = parser.parseFromString(actual, 'text/html');
    actualDOM.normalize();
    const expectedDOM = parser.parseFromString(expected, 'text/html');
    expectedDOM.normalize();
    this.pushResult({
      result: actualDOM.body.isEqualNode(expectedDOM.body),
      actual: actualDOM.body.innerHTML,
      expected: expectedDOM.body.innerHTML,
      message: `WARNING: attribute order differences will give false positive diff markers in the test report, they do not count for the isEqual check, you can safely ignore them\n\n ${message}`,
    });
  };
  setupDom(QUnit.assert);
  setApplication(Application.create(config.APP));

  const defaultDumpDepth = QUnit.dump.maxDepth;

  QUnit.hooks.afterEach(() => {
    QUnit.dump.maxDepth = defaultDumpDepth;
  });

  qunitStart();
}
