/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import sampleData from '../config/sample-data';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { decentLocaleMatch } from '@lblod/ember-rdfa-editor/utils/intl-utils';
import type IntlService from 'ember-intl/services/intl';

export default class ApplicationRoute extends Route {
  @service declare intl: IntlService;

  async beforeModel() {
    await Promise.allSettled([
      this.loadTranslations('nl-be'),
      this.loadTranslations('en-us'),
    ]);
    const userLocales = decentLocaleMatch(
      navigator.languages,
      this.intl.locales,
      'en-us',
    );
    this.intl.setLocale(userLocales);
  }

  private async loadTranslations(locale: 'nl-be' | 'en-us') {
    let translations;
    switch (locale) {
      case 'nl-be':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        translations = (
          await import(
            // @ts-expect-error we don't have types for these files
            '@lblod/ember-rdfa-editor/translations/nl-be.yaml'
          )
        ).default;
        break;
      case 'en-us':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        translations = (
          await import(
            // @ts-expect-error we don't have types for these files
            '@lblod/ember-rdfa-editor/translations/en-us.yaml'
          )
        ).default;
        break;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.intl.addTranslations(locale, translations);
  }

  model() {
    return sampleData;
  }
}
