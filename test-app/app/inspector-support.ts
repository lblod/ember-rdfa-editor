/**
 * Workaround to get the ember-inspector working with vite applications.
 * Once ember-inspector gets native vite support, we can remove this.
 */

import Ember from 'ember';
import * as runtime from '@glimmer/runtime';
import * as tracking from '@glimmer/tracking';
import * as validator from '@glimmer/validator';
// @ts-expect-error this dep is not installed directly
import * as reference from '@glimmer/reference';
// @ts-expect-error this dep is not installed directly
import * as destroyable from '@glimmer/destroyable';
import { RSVP } from '@ember/-internals/runtime';
import config from './config/environment';

window.define('@glimmer/tracking', () => tracking);
window.define('@glimmer/runtime', () => runtime);
window.define('@glimmer/validator', () => validator);
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
window.define('@glimmer/reference', () => reference);
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
window.define('@glimmer/destroyable', () => destroyable);
window.define('rsvp', () => RSVP);
window.define('ember', () => ({ default: Ember }));
window.define('test-app/config/environment', () => ({
  default: config,
}));
