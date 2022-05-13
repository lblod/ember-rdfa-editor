import { INVISIBLE_SPACE } from './constants';

export default class StringUtils {
  static isAllWhiteSpace(text: string): boolean {
    return !/[^\t\n\r \u00A0]/.test(text);
  }

  static getInvisibleSpaceCount(text: string): number {
    return text.split('').filter((c) => c === INVISIBLE_SPACE).length;
  }
}
