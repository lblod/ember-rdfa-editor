import * as QUnit from 'qunit';
import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import { setup } from 'qunit-dom';

setup(QUnit.assert);

setApplication(Application.create(config.APP));

start();
