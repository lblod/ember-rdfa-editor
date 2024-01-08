import sampleData from '../config/sample-data';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type { IntlService as Intl } from 'ember-intl';

export default class ApplicationRoute extends Route {
  @service declare intl: Intl;

  beforeModel() {
    const userLocale = navigator.language || navigator.languages[0];
    this.intl.setLocale([userLocale, 'nl-BE']);
  }

  model() {
    return sampleData;
  }
}
