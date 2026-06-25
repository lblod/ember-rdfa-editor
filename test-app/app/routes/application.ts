/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Route from '@ember/routing/route';
import { service } from '@ember/service';
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
    let pluginTrans;
    // TODO this is unscalable. We should move to the ember-intl vite plugin.
    let rr;
    let ar;
    switch (locale) {
      case 'nl-be':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        translations = (
          await import(
            // @ts-expect-error we don't have types for these files
            '@lblod/ember-rdfa-editor/translations/nl-be.yaml'
          )
        ).default;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pluginTrans = (
          await import(
            // @ts-expect-error we don't have types for these files
            '@lblod/ember-rdfa-editor-lblod-plugins/translations/nl-BE.yaml'
          )
        ).default;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        rr = (
          await import(
            // @ts-expect-error we don't have types for these files
            '@lblod/say-roadsign-regulation-plugin/translations/nl-be.yaml'
          )
        ).default;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ar = (
          await import(
            // @ts-expect-error we don't have types for these files
            '@lblod/say-ar-design-plugin/translations/nl-be.yaml'
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pluginTrans = (
          await import(
            // @ts-expect-error we don't have types for these files
            '@lblod/ember-rdfa-editor-lblod-plugins/translations/en-US.yaml'
          )
        ).default;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        rr = (
          await import(
            // @ts-expect-error we don't have types for these files
            '@lblod/say-roadsign-regulation-plugin/translations/en-us.yaml'
          )
        ).default;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ar = (
          await import(
            // @ts-expect-error we don't have types for these files
            '@lblod/say-ar-design-plugin/translations/en-us.yaml'
          )
        ).default;
        break;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.intl.addTranslations(locale, translations);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.intl.addTranslations(locale, pluginTrans);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.intl.addTranslations(locale, rr);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.intl.addTranslations(locale, ar);
  }
}
