import sampleData from '../config/sample-data';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { decentLocaleMatch } from '@lblod/ember-rdfa-editor/utils/intl-utils';
import type IntlService from 'ember-intl/services/intl';

export default class ApplicationRoute extends Route {
  @service declare intl: IntlService;

  beforeModel() {
    const userLocales = decentLocaleMatch(
      navigator.languages,
      this.intl.locales,
      'en-US',
    );
    this.intl.setLocale(userLocales);
  }

  model() {
    return sampleData;
  }
}
