/**
 * Helper function to help pick supported locales for ember-intl.
 * Returns exact matches first, then language matches, then the default.
 **/
export function decentLocaleMatch(
  userLocales: string[] | readonly string[],
  supportedLocales: string[],
  defaultLocale: string,
) {
  // Ember-intl lowercases locales so we can make comparisons easier by doing the same
  const userLocs = userLocales.map((locale) => locale.toLowerCase());
  const supportedLocs = supportedLocales.map((locale) => locale.toLowerCase());

  // First find exact matches. Use a set to avoid duplicates while preserving insert order.
  const matches = new Set(
    userLocs.filter((locale) => supportedLocs.includes(locale)),
  );

  // Then look for locales that just match based on language,
  // e.g. match en or en-US if looking for en-GB
  const languageMap: Record<string, string[] | undefined> = {};
  supportedLocs.forEach((locale) => {
    const lang = locale.split('-')[0];
    languageMap[lang] = [...(languageMap[lang] || []), locale];
  });
  userLocs.forEach((locale) => {
    const looseMatches = languageMap[locale.split('-')[0]] ?? [];
    looseMatches.forEach((match) => matches.add(match));
  });

  // Add the default so we always have something
  matches.add(defaultLocale.toLowerCase());
  return [...matches];
}
