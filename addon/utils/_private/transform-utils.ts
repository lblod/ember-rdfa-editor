import { Transform } from 'prosemirror-transform';

/**
 * Group of utility functions which extend/complement the functionality of the prosemirror `Transform` class
 */
export default class TransformUtils {
  /**
   * Utility function which acts as a wrapper for the `setNodeAttribute` and `setAttribute` method of the
   * prosemirror `Transform` class.
   * The provided position `pos` can be either a valid position in the document; or `-1` for the `doc` node
   *
   */
  static setAttribute<T extends Transform>(
    tr: T,
    pos: number,
    key: string,
    value: unknown,
  ) {
    if (pos < -1) {
      throw new Error(`Provided position ${pos} is invalid`);
    }
    if (pos === -1) {
      return tr.setDocAttribute(key, value);
    } else {
      return tr.setNodeAttribute(pos, key, value);
    }
  }
}
