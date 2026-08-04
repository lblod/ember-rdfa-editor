import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';
import compatModules from '@embroider/virtual/compat-modules';
import './styles/app.scss';
import { test } from '@lblod/ember-rdfa-editor/test';
import { test2 } from '@lblod/ember-rdfa-editor/tets';
console.log(test);
console.log(test2);

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
  inspector = setupInspector(this);
}

loadInitializers(App, config.modulePrefix, compatModules);
