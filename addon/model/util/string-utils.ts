export default class StringUtils {
  static isAllWhiteSpace(text: string): boolean {
    return !/[^\t\n\r \u00A0]/.test(text);
  }
}
