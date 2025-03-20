import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import Ember from 'ember';
import * as runtime from '@glimmer/runtime';
import * as tracking from '@glimmer/tracking';
import * as validator from '@glimmer/validator';
import { RSVP } from '@ember/-internals/runtime';

// Workaround to get ember inspector to work, checkout https://github.com/emberjs/ember-inspector/issues/2612
window.define('@glimmer/tracking', () => tracking);
window.define('@glimmer/runtime', () => runtime);
window.define('@glimmer/validator', () => validator);
window.define('rsvp', () => RSVP);
window.define('ember', () => ({ default: Ember }));
window.define('test-app/config/environment', () => ({
  default: config,
}));

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
