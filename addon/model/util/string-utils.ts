export default class StringUtils {
  // TODO: This is used nowhere, but this doesn't quite match `isAllWhiteSpace` in `dom-helpers.ts`.
  static isAllWhiteSpace(text: string): boolean {
    return !(/[^\t\n\r \u00A0]/.test(text));
  }
}
