/* eslint-disable */
//@ts-nocheck
// TODO: linting disabled cause of really bad and incomplete qunit typings, fix
import * as QUnit from 'qunit';
import Application from 'test-app/app';
import config from 'test-app/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start as qunitStart } from 'ember-qunit';
import { setup as setupDom } from 'qunit-dom';
import { equiv } from 'qunit';
import { nodeParser } from './helpers/qunit/parsers';
import { deepArrayContains } from './helpers/qunit/assertions';

export function start() {
  // Set-up custom parsers and assertions
  QUnit.dump.setParser('node', nodeParser);
  QUnit.assert.deepArrayContains = deepArrayContains;
  setupDom(QUnit.assert);
  setApplication(Application.create(config.APP));

  const defaultDumpDepth = QUnit.dump.maxDepth;

  QUnit.hooks.afterEach(() => {
    QUnit.dump.maxDepth = defaultDumpDepth;
  });

  qunitStart();
}
